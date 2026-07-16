import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { publicProjectArchive } from "../src/content/public-project-archive";

const newlyPublishedRepository = {
  description: "A newly public learning game project.",
  html_url: "https://github.com/JasonTM17/Horror_Game_Funny",
  language: "GDScript",
  name: "Horror_Game_Funny",
  topics: ["game-development"],
  updated_at: "2026-07-15T01:00:00Z",
};

const curatedRepositorySnapshot = publicProjectArchive.map((project) => ({
  description: project.description,
  html_url: project.href,
  language: project.tags[0] ?? null,
  name: project.href.split("/").at(-1),
  topics: project.tags.map((tag) => tag.toLowerCase()),
  updated_at: "2026-07-14T01:00:00Z",
}));

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\/api\.github\.com\/users\/JasonTM17\/repos\?/, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([newlyPublishedRepository, ...curatedRepositorySnapshot]),
    });
  });
});

test("has semantic content without serious accessibility violations", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  const seriousViolations = results.violations.filter((violation) =>
    ["critical", "serious"].includes(violation.impact ?? ""),
  );

  expect(seriousViolations).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("keeps keyboard access and avoids mobile horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByText("Skip to content")).toBeFocused();
  await expect(page.getByRole("button", { name: "Reduce motion" })).toBeVisible();

  const headerHeight = await page.locator(".site-header").evaluate((header) => header.getBoundingClientRect().height);
  expect(headerHeight).toBeLessThanOrEqual(110);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  const launcher = page.getByRole("button", { name: /open sơn ai portfolio chatbot/i });
  await expect(launcher.getByText("Portfolio chatbot")).toBeVisible();
  const launcherBounds = await launcher.boundingBox();
  expect(launcherBounds?.width).toBeGreaterThanOrEqual(140);
  expect(launcherBounds?.width).toBeLessThanOrEqual(190);
});

test("keeps anchor headings clear of the sticky header and exposes direct 3D controls", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /20 public projects/i })).toBeVisible();
  await expect(page.locator("a[href='https://github.com/JasonTM17/Horror_Game_Funny']")).toBeVisible();
  await expect(page.locator(".studio-scene-host canvas")).toHaveCount(1);
  await expect(page.locator(".studio-scene__portrait")).toBeVisible();
  await expect(page.locator(".studio-scene__portrait")).toHaveCSS("opacity", "1");
  await expect(page.locator(".studio-scene")).toHaveAttribute("data-scene-mode", "hybrid-artwork-3d");
  await expect(page.getByRole("group", { name: "3D studio controls" })).toBeVisible();

  await page.getByRole("link", { name: "Archive" }).click();
  await expect(page.getByRole("link", { name: "Archive" })).toHaveAttribute("aria-current", "location");
  const positions = await page.evaluate(() => {
    const header = document.querySelector(".site-header")?.getBoundingClientRect();
    const heading = document.querySelector("#archive-heading")?.getBoundingClientRect();
    return { headerBottom: header?.bottom ?? 0, headingTop: heading?.top ?? 0 };
  });

  expect(positions.headingTop).toBeGreaterThan(positions.headerBottom + 8);
});

test("keeps a manual 3D rotation until it is explicitly reset", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Runs only in the desktop interaction project.");

  await page.goto("/");
  await expect(page.locator(".studio-scene-host canvas")).toHaveCount(1);

  const host = page.locator(".studio-scene-host");
  await host.scrollIntoViewIfNeeded();
  const initialRotation = await page.locator(".studio-scene").evaluate((element) => ({
    x: Number.parseFloat(element.style.getPropertyValue("--studio-rotation-x")),
    y: Number.parseFloat(element.style.getPropertyValue("--studio-rotation-y")),
  }));
  const bounds = await host.boundingBox();
  if (!bounds) throw new Error("The 3D interaction surface has no layout bounds.");

  const dragPath = await page.evaluate((hostBounds) => {
    const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
    const top = Math.max(hostBounds.y + 40, headerBottom + 32);
    const bottom = Math.min(hostBounds.y + hostBounds.height - 40, window.innerHeight - 40);
    if (bottom <= top) throw new Error("No visible area is available for the 3D drag assertion.");

    return {
      endX: hostBounds.x + hostBounds.width * 0.68,
      endY: top + (bottom - top) * 0.68,
      startX: hostBounds.x + hostBounds.width * 0.3,
      startY: top + (bottom - top) * 0.32,
    };
  }, bounds);

  await page.mouse.move(dragPath.startX, dragPath.startY);
  await page.mouse.down();
  await page.mouse.move(dragPath.endX, dragPath.endY);
  await expect(page.locator(".studio-scene")).toHaveAttribute("data-dragging", "true");
  await page.mouse.up();
  await expect(page.locator(".studio-scene")).not.toHaveAttribute("data-dragging");

  const rotationBeforeReset = await page.locator(".studio-scene").evaluate((element) => ({
    x: Number.parseFloat(element.style.getPropertyValue("--studio-rotation-x")),
    y: Number.parseFloat(element.style.getPropertyValue("--studio-rotation-y")),
  }));
  expect(rotationBeforeReset.x).not.toBeCloseTo(initialRotation.x, 1);
  expect(rotationBeforeReset.y).not.toBeCloseTo(initialRotation.y, 1);

  await page.getByRole("button", { name: "Reset 3D view" }).click();
  await expect.poll(async () => Math.abs(await page.locator(".studio-scene").evaluate((element) =>
    Number.parseFloat(element.style.getPropertyValue("--studio-rotation-x")),
  ) - initialRotation.x)).toBeLessThan(0.25);
  await expect.poll(async () => Math.abs(await page.locator(".studio-scene").evaluate((element) =>
    Number.parseFloat(element.style.getPropertyValue("--studio-rotation-y")),
  ) - initialRotation.y)).toBeLessThan(0.25);

});

test("opens a grounded portfolio assistant in the lower-right corner", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        answer: "DevHire Cloud is a Java and DevOps learning project.",
        serverRemaining: 74,
        sources: ["DevHire Cloud project"],
      }),
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: /open sơn ai portfolio chatbot/i }).click();

  await expect(page.getByRole("dialog", { name: /ask about son's learning path/i })).toBeVisible();
  await expect(page.getByText(/questions remain in this browser/i)).toHaveCount(0);
  await page.getByLabel(/ask about nguyen son's portfolio/i).fill("Which project uses Java?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText(/devhire cloud is a java and devops learning project/i)).toBeVisible();
});

test("keeps the Vietnamese interface, chat request, and compact header in sync", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    const request = JSON.parse(route.request().postData() ?? "{}");
    expect(request.language).toBe("vi");
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        answer: "DevHire Cloud là dự án học Java và DevOps.",
        serverRemaining: 74,
        sources: ["DevHire Cloud project"],
      }),
    });
  });
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await page.getByRole("button", { name: "Vietnamese" }).click();

  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page).toHaveTitle("Nguyễn Sơn | Sinh viên CNTT · Software & DevOps");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Portfolio của Nguyễn Sơn: kỹ nghệ phần mềm, DevOps, quy trình thời gian thực, ứng dụng di động và AI ứng dụng.",
  );
  await expect(page.getByText("Học có mục tiêu. Xây từng bước.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Kho dự án" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Đặt lại góc nhìn 3D" })).toBeVisible();

  await page.getByRole("button", { name: "Mở chatbot portfolio Sơn AI" }).click();
  await page.getByLabel("Hỏi về portfolio của Nguyễn Sơn").fill("Dự án nào dùng Java?");
  await page.getByRole("button", { name: "Gửi" }).click();
  await expect(page.getByText(/devhire cloud là dự án học java/i)).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("keeps the skip-link target clear of the sticky header on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");

  const positions = await page.evaluate(() => {
    const header = document.querySelector(".site-header")?.getBoundingClientRect();
    const main = document.querySelector("#main-content")?.getBoundingClientRect();
    return { headerBottom: header?.bottom ?? 0, mainTop: main?.top ?? 0 };
  });

  expect(positions.mainTop).toBeGreaterThanOrEqual(positions.headerBottom);
});

test("uses the static studio illustration when the operating system reduces motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForTimeout(500);

  await expect(page.locator(".studio-scene__portrait")).toBeVisible();
  await expect(page.locator(".studio-scene__portrait")).toHaveCSS("opacity", "1");
  await expect(page.locator(".studio-scene-fallback")).toHaveCSS("opacity", "0");
  await expect(page.locator(".studio-scene-host canvas")).toHaveCount(0);
  await expect(page.getByText("Portfolio chatbot")).toBeVisible();
  await expect(page.locator(".portfolio-assistant__mascot")).toHaveCSS("animation-name", "none");
  const launcherBounds = await page.getByRole("button", { name: /open sơn ai portfolio chatbot/i }).boundingBox();
  expect(launcherBounds?.height).toBeGreaterThanOrEqual(44);
});

test("uses the static studio illustration in forced-colors mode", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/");
  await page.waitForTimeout(500);

  await expect(page.locator(".studio-scene-fallback")).toBeVisible();
  await expect(page.locator(".studio-scene-fallback")).toHaveCSS("opacity", "1");
  await expect(page.locator(".studio-scene-host canvas")).toHaveCount(0);
  await expect(page.getByText("Portfolio chatbot")).toBeVisible();
  await expect(page.locator(".portfolio-assistant__mascot")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".portfolio-assistant__launcher")).toHaveCSS("box-shadow", "none");
});

test("restores the static studio illustration after a WebGL context loss", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator(".studio-scene-host canvas");
  await expect(canvas).toHaveCount(1);

  await canvas.dispatchEvent("webglcontextlost");

  await expect(canvas).toHaveCount(0);
  await expect(page.locator(".studio-scene__portrait")).toBeVisible();
  await expect(page.locator(".studio-scene__portrait")).toHaveCSS("opacity", "1");
  await expect(page.locator(".studio-scene-fallback")).toHaveCSS("opacity", "0");
});

test("keeps touch scrolling and 3D controls available on coarse-pointer devices", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Runs only in the coarse-pointer project.");
  test.slow();
  await page.goto("/");
  await expect(page.locator(".studio-scene-host canvas")).toHaveCount(1);
  expect(await page.evaluate(() => window.matchMedia("(pointer: fine)").matches)).toBe(false);
  const host = page.locator(".studio-scene-host");
  await expect(host).toHaveCSS("touch-action", "pan-y");

  await host.scrollIntoViewIfNeeded();
  const touchPath = await host.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
    const startY = Math.min(window.innerHeight - 90, Math.max(headerBottom + 180, rect.top + rect.height * 0.65));
    return { endY: startY - 110, startY, x: rect.left + rect.width * 0.5 };
  });
  const scrollBeforeSwipe = await page.evaluate(() => window.scrollY);
  const browserSession = await page.context().newCDPSession(page);
  await browserSession.send("Input.dispatchTouchEvent", {
    touchPoints: [{ x: touchPath.x, y: touchPath.startY }],
    type: "touchStart",
  });
  await browserSession.send("Input.dispatchTouchEvent", {
    touchPoints: [{ x: touchPath.x + 2, y: touchPath.endY }],
    type: "touchMove",
  });
  await browserSession.send("Input.dispatchTouchEvent", { touchPoints: [], type: "touchEnd" });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollBeforeSwipe + 10);
  await host.scrollIntoViewIfNeeded();
  await expect(host).toBeInViewport();

  const rotationBefore = await page.locator(".studio-scene").evaluate((element) =>
    Number.parseFloat(element.style.getPropertyValue("--studio-rotation-y")),
  );
  await page.getByRole("button", { name: "Rotate 3D studio right" }).click();
  await expect.poll(async () => page.locator(".studio-scene").evaluate((element) =>
    Number.parseFloat(element.style.getPropertyValue("--studio-rotation-y")),
  )).not.toBeCloseTo(rotationBefore, 1);
});
