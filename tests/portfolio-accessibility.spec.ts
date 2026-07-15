import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\/api\.github\.com\/users\/JasonTM17\/repos\?/, async (route) => {
    await route.fulfill({ contentType: "application/json", body: "[]" });
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

  const launcherBounds = await page.getByRole("button", { name: /ask son's guide/i }).boundingBox();
  expect(launcherBounds?.width).toBeLessThanOrEqual(56);
});

test("keeps anchor headings clear of the sticky header and exposes the 3D interaction", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".studio-scene-host canvas")).toHaveCount(1);

  await page.getByRole("button", { name: "Interact with 3D" }).click();
  await expect(page.getByRole("button", { name: "Reset 3D view" })).toHaveAttribute("aria-pressed", "true");

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
  await page.getByRole("button", { name: "Interact with 3D" }).click();

  const host = page.locator(".studio-scene-host");
  await host.scrollIntoViewIfNeeded();
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
    x: element.style.getPropertyValue("--studio-tilt-x"),
    y: element.style.getPropertyValue("--studio-tilt-y"),
  }));
  expect(rotationBeforeReset.x).not.toBe("0deg");
  expect(rotationBeforeReset.y).not.toBe("0deg");

  await page.getByRole("button", { name: "Reset 3D view" }).click();
  await expect(page.getByRole("button", { name: "Interact with 3D" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".studio-scene")).toHaveAttribute("data-interactive", "false");

  const rotationAfterReset = await page.locator(".studio-scene").evaluate((element) => ({
    x: element.style.getPropertyValue("--studio-tilt-x"),
    y: element.style.getPropertyValue("--studio-tilt-y"),
  }));
  expect(rotationAfterReset).toEqual({ x: "0deg", y: "0deg" });
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
  await page.getByRole("button", { name: /ask son's guide/i }).click();

  await expect(page.getByRole("dialog", { name: /ask about son's learning path/i })).toBeVisible();
  await page.getByLabel(/ask about nguyen son's portfolio/i).fill("Which project uses Java?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText(/devhire cloud is a java and devops learning project/i)).toBeVisible();
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

  await expect(page.locator(".studio-scene-fallback")).toBeVisible();
  await expect(page.locator(".studio-scene-fallback")).toHaveCSS("opacity", "1");
  await expect(page.locator(".studio-scene-host canvas")).toHaveCount(0);
});

test("uses the static studio illustration in forced-colors mode", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/");
  await page.waitForTimeout(500);

  await expect(page.locator(".studio-scene-fallback")).toBeVisible();
  await expect(page.locator(".studio-scene-fallback")).toHaveCSS("opacity", "1");
  await expect(page.locator(".studio-scene-host canvas")).toHaveCount(0);
});

test("restores the static studio illustration after a WebGL context loss", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator(".studio-scene-host canvas");
  await expect(canvas).toHaveCount(1);

  await canvas.dispatchEvent("webglcontextlost");

  await expect(canvas).toHaveCount(0);
  await expect(page.locator(".studio-scene-fallback")).toBeVisible();
  await expect(page.locator(".studio-scene-fallback")).toHaveCSS("opacity", "1");
});

test("keeps the scene optional for coarse-pointer devices", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Runs only in the coarse-pointer project.");

  await page.addInitScript(() => {
    const originalRequestAnimationFrame = window.requestAnimationFrame.bind(window);
    let scheduledFrames = 0;

    Object.defineProperty(window, "__signalScheduledFrames", {
      get: () => scheduledFrames,
    });
    window.requestAnimationFrame = (callback) => {
      scheduledFrames += 1;
      return originalRequestAnimationFrame(callback);
    };
  });
  await page.goto("/");
  await expect(page.locator(".studio-scene-host canvas")).toHaveCount(1);
  await page.waitForTimeout(100);

  const framesBeforePointerMove = await page.evaluate(
    () => (window as unknown as { __signalScheduledFrames: number }).__signalScheduledFrames,
  );
  await page.locator(".studio-scene-host").dispatchEvent("pointermove", {
    clientX: 120,
    clientY: 160,
  });
  await page.waitForTimeout(100);

  const framesAfterPointerMove = await page.evaluate(
    () => (window as unknown as { __signalScheduledFrames: number }).__signalScheduledFrames,
  );

  expect(await page.evaluate(() => window.matchMedia("(pointer: fine)").matches)).toBe(false);
  expect(framesAfterPointerMove).toBe(framesBeforePointerMove);
});
