import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { publicProjectArchive } from "../src/content/public-project-archive";
import pinnedSnapshot from "../src/content/pinned-projects.json" with { type: "json" };

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
  await page.route("**/api/pinned-projects", async (route) => {
    await route.fulfill({ json: { ...pinnedSnapshot, verifiedAt: new Date().toISOString() } });
  });
  await page.route("**/api/public-projects", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ repositories: [newlyPublishedRepository, ...curatedRepositorySnapshot].map((repo) => ({ name: repo.name, href: repo.html_url, description: repo.description, language: repo.language, topics: repo.topics, updatedAt: repo.updated_at })), source: "https://github.com/JasonTM17?tab=repositories", verifiedAt: new Date().toISOString(), stale: false }),
    });
  });
});

test("pinned work follows GitHub order and refreshes pin changes without a redeploy", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  let feed = pinnedSnapshot;
  await page.route("**/api/pinned-projects", async (route) => route.fulfill({ json: feed }));
  await page.goto("/");
  const links = page.locator(".project-card .text-link");
  await expect(links).toHaveCount(6);
  expect(await links.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")))).toEqual(feed.repositories.map((repo) => repo.href));
  feed = { ...pinnedSnapshot, repositories: pinnedSnapshot.repositories.slice(1).reverse() };
  await page.clock.fastForward(60_000);
  await expect(links).toHaveCount(5);
  expect(await links.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")))).toEqual(feed.repositories.map((repo) => repo.href));
  feed = { ...pinnedSnapshot, repositories: [] };
  await page.clock.fastForward(60_000);
  await expect(links).toHaveCount(0);
  await expect(page.getByText(/no public repositories are currently pinned/i)).toBeVisible();
});

test("pinned work labels fallback data when GitHub is unavailable", async ({ page }) => {
  await page.clock.install({ time: new Date(pinnedSnapshot.verifiedAt) });
  await page.route("**/api/pinned-projects", async (route) => route.fulfill({ status: 503, json: { error: "unavailable" } }));
  await page.goto("/");
  await expect(page.locator(".selected-work-status")).toContainText("Showing the saved pins verified");
  await expect(page.locator(".project-card")).toHaveCount(6);
});

test("archive discovery searches hidden projects, filters technology and resets", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /20 public projects/i })).toBeVisible();
  const cards = page.locator(".archive-card");
  await expect(cards).toHaveCount(6);
  await page.getByRole("link", { name: "Archive", exact: true }).click();
  const more = page.getByRole("button", { name: "Show 6 more projects" });
  await more.focus();
  await page.keyboard.press("Enter");
  await expect(cards).toHaveCount(12);
  await expect(more).toBeFocused();
  const search = page.getByRole("searchbox", { name: "Search public projects" });
  await search.fill("BookStore");
  await expect(cards).toHaveCount(1);
  await expect(cards.getByRole("heading", { name: "BookStore" })).toBeVisible();
  await page.getByRole("button", { name: "Reset view" }).click();
  await expect(search).toBeFocused();
  await page.getByRole("combobox", { name: "Technology" }).selectOption("Python");
  await expect(cards).toHaveCount(3);
  await expect(cards.getByRole("heading")).toHaveText(["Trash Sorter Pro", "15-puzzle AI Lab", "8-puzzle AI Lab"]);
  await search.fill("no-matching-project-123");
  await expect(cards).toHaveCount(0);
  await expect(page.getByText(/no matching projects yet/i)).toBeVisible();
  await page.getByRole("button", { name: "Reset view" }).click();
  await expect(cards).toHaveCount(6);
});

test("keeps archive filter position stable when reset appears and disappears", async ({ page }) => {
  test.slow();
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await page.getByRole("button", { name: /^(English|Tiếng Anh)$/ }).click();
    await expect(page.locator("#archive-heading")).toContainText("20 public projects");
    for (const language of [/^(English|Tiếng Anh)$/, /^(Vietnamese|Tiếng Việt)$/]) {
      await page.getByRole("button", { name: language }).click();
      const select = page.locator(".archive-filter select");
      const search = page.getByRole("searchbox");
      const toolbar = page.locator(".archive-toolbar");
      const reset = page.locator(".archive-reset");
      const geometry = async () => ({
        filter: await select.evaluate((element) => ({ x: element.getBoundingClientRect().x, y: element.getBoundingClientRect().y + scrollY, width: element.getBoundingClientRect().width })),
        search: await search.evaluate((element) => ({ x: element.getBoundingClientRect().x, y: element.getBoundingClientRect().y + scrollY, width: element.getBoundingClientRect().width })),
        height: await toolbar.evaluate((element) => element.getBoundingClientRect().height),
      });
      const original = await geometry();
      const assertStable = async () => {
        const current = await geometry();
        for (const control of ["filter", "search"] as const) {
          for (const property of ["x", "y", "width"] as const) expect(Math.abs(current[control][property] - original[control][property])).toBeLessThanOrEqual(1);
        }
        expect(Math.abs(current.height - original.height)).toBeLessThanOrEqual(1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      };
      await expect(reset).toHaveCount(0);
      await select.selectOption("Java");
      await expect(reset).toBeVisible();
      await assertStable();
      await reset.click();
      await expect(search).toBeFocused();
      await assertStable();
      await search.fill("BookStore");
      await assertStable();
      await reset.click();
      await page.locator(".archive-more button").click();
      await assertStable();
      await reset.click();
      await expect(reset).toHaveCount(0);
      await assertStable();
    }
  }
});

test("archive discovery remains localized and supports Vietnamese without accents", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Vietnamese", exact: true }).click();
  await page.getByRole("searchbox", { name: "Tìm dự án công khai" }).fill("dai hoc");
  await expect(page.locator(".archive-card")).toHaveCount(1);
  await expect(page.locator(".archive-card h3")).toHaveText("CampusCore");
  await page.getByRole("button", { name: "Đặt lại bộ lọc" }).click();
  await expect(page.locator(".archive-card")).toHaveCount(6);
  await expect(page.getByRole("button", { name: "Xem thêm 6 dự án" })).toBeVisible();
});

test("accepts a freshly received public catalog with bounded server clock skew", async ({ page }) => {
  await page.route("**/api/public-projects", async (route) => {
    const browserNow = await page.evaluate(() => Date.now());
    await route.fulfill({ json: { source: "https://github.com/JasonTM17?tab=repositories", verifiedAt: new Date(browserNow + 500).toISOString(), stale: false, repositories: [
      { name: "Clock_Skew_Project", href: "https://github.com/JasonTM17/Clock_Skew_Project", description: "A new public project", language: "Java", topics: [], updatedAt: null },
    ] } });
  });
  await page.goto("/");
  await expect(page.locator("#archive-heading")).toContainText("1 public projects");
  await expect(page.locator(".archive-card h3")).toHaveText(["Clock Skew Project"]);
  await expect(page.locator(".archive-sync")).toContainText("Live GitHub metadata synced");
});

test("groups normalized technologies and keeps non-technology topics searchable", async ({ page }) => {
  await page.route("**/api/public-projects", async (route) => route.fulfill({ json: { source: "https://github.com/JasonTM17?tab=repositories", verifiedAt: new Date().toISOString(), stale: false, repositories: [
    { name: "Fresh_Java_Project", href: "https://github.com/JasonTM17/Fresh_Java_Project", description: "A learning project", language: "Java", topics: ["java", "Java", "spring-boot", "docker", "Docker", "greeting-card"], updatedAt: null },
    { name: "Fresh_Go_Project", href: "https://github.com/JasonTM17/Fresh_Go_Project", description: "A Go learning project", language: "Go", topics: ["golang"], updatedAt: null },
  ] } }));
  await page.goto("/");
  const filter = page.getByRole("combobox", { name: "Technology" });
  await expect(page.locator(".archive-card")).toHaveCount(2);
  await expect(filter.locator('option[value="Java"]')).toHaveCount(1);
  await expect(filter.locator('option[value="Docker"]')).toHaveCount(1);
  await expect(filter.locator('option[value="Go"]')).toHaveCount(1);
  await expect(filter.locator('option[value="greeting-card"]')).toHaveCount(0);
  await expect(filter.locator("optgroup")).toHaveCount(3);
  await filter.selectOption("Docker");
  await expect(page.locator(".archive-card h3")).toHaveText(["Fresh Java Project"]);
  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  await page.getByRole("searchbox", { name: "Search public projects" }).fill("greeting-card");
  await expect(page.locator(".archive-card h3")).toHaveText(["Fresh Java Project"]);
});

test("presents distinct project briefs and verified demos in both languages", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".project-card h3")).toHaveText(["Trash Sorter Pro", "BookStore", "JobHunter", "LaptopShop", "HealthCare", "CampusUTE"]);
  const brief = page.locator(".project-card .project-brief").first();
  await brief.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(brief.getByText("The problem", { exact: true })).toBeVisible();
  await expect(page.locator(".project-card .project-demo")).toHaveCount(3);
  await expect(page.locator(".project-card").nth(1).locator(".project-demo")).toHaveCount(0);
  await page.getByRole("button", { name: "Vietnamese", exact: true }).click();
  await expect(brief.getByText("Bài toán", { exact: true })).toBeVisible();
  await expect(brief.getByText("Cách xây dựng", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kết nối qua GitHub", exact: true })).toHaveAttribute("href", "https://github.com/JasonTM17");
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("serves optimized portrait and static sharing metadata without changing studio framing", async ({ page, request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain('property="og:image"');
  expect(html).toContain('content="https://nguyen-son-portfolio.vercel.app/social-preview.png"');
  expect(html).toContain('rel="canonical"');
  expect((await request.get("/social-preview.png")).status()).toBe(200);
  expect((await request.get("/favicon.svg")).status()).toBe(200);
  await page.goto("/");
  const portrait = page.locator(".studio-scene__portrait");
  await portrait.evaluate((image: HTMLImageElement) => image.decode());
  expect(await portrait.evaluate((image: HTMLImageElement) => image.currentSrc)).toMatch(/nguyen-son-studio-(640|1023)\.avif$/);
  const scene = await page.locator(".studio-scene").boundingBox();
  expect(scene?.height).toBeGreaterThanOrEqual(430);
  await expect(page.locator(".studio-scene")).toHaveCSS("border-radius", "13.6px");
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

  const launcher = page.getByRole("button", { name: /open ai assistant/i });
  const launcherBounds = await launcher.boundingBox();
  expect(launcherBounds?.width).toBeGreaterThanOrEqual(44);
  expect(launcherBounds?.width).toBeLessThanOrEqual(56);
  await expect(launcher.locator("img")).toBeVisible();
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

test("keeps compact 3D controls touch-sized with keyboard-accessible help", async ({ page }) => {
  await page.goto("/");
  const toolbar = page.getByRole("group", { name: "3D studio controls" });
  await expect(toolbar).toBeVisible();
  const bounds = await toolbar.boundingBox();
  expect(bounds?.width).toBeLessThanOrEqual(200);
  expect(bounds?.height).toBeLessThanOrEqual(56);
  for (const control of await toolbar.locator("button, summary").all()) {
    const target = await control.boundingBox();
    expect(target?.width).toBeGreaterThanOrEqual(44);
    expect(target?.height).toBeGreaterThanOrEqual(44);
  }

  const help = page.getByLabel("3D controls help", { exact: true });
  const instructions = page.getByText("Drag or swipe the 3D icon layer to rotate it.", { exact: true });
  await expect(instructions).toBeHidden();
  await help.focus();
  await page.keyboard.press("Enter");
  await expect(instructions).toBeVisible();
  const helpBounds = await instructions.boundingBox();
  expect(helpBounds?.x).toBeGreaterThanOrEqual(0);
  expect((helpBounds?.x ?? 0) + (helpBounds?.width ?? 0)).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  await page.keyboard.press("Escape");
  await expect(instructions).toBeHidden();
  await expect(help).toBeFocused();

  await page.getByRole("button", { name: "Vietnamese", exact: true }).click();
  const localizedHelp = page.getByLabel("Hướng dẫn điều khiển 3D", { exact: true });
  await localizedHelp.click();
  await expect(page.locator(".studio-scene__interaction-hint")).toBeVisible();
  await expect(page.getByRole("button", { name: "Đặt lại góc nhìn 3D" })).toBeVisible();
  await localizedHelp.click();
  await expect(page.locator(".studio-scene__interaction-hint")).toBeHidden();
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
  await page.route("**/api/portfolio-assistant", async (route) => {
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
  await page.getByRole("button", { name: /open ai assistant/i }).click();

  await expect(page.getByRole("dialog", { name: /ask about son's learning path/i })).toBeVisible();
  await expect(page.getByText(/questions remain in this browser/i)).toHaveCount(0);
  await page.getByLabel(/ask about nguyen son's portfolio/i).fill("Which project uses Java?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText(/devhire cloud is a java and devops learning project/i)).toBeVisible();
});

test("formats assistant project replies into spaced paragraphs and a safe ordered list", async ({ page }) => {
  await page.route("**/api/portfolio-assistant", async (route) => route.fulfill({ json: {
    answer: "Dữ liệu đã xác minh.\n\nTheo thứ tự ghim:\n\n1. App_AI_powered_waste_sorting — YOLO, PySide6 và Next.js.\n2. Ecommerce_BookStore — Spring Boot và Next.js.\n3. JobHunter — Java và MySQL.\n4. LaptopShop — Spring Boot MVC.\n5. HealthCare — FastAPI và PostgreSQL.\n6. CampusUTE — cổng học vụ song ngữ.",
    sources: ["HealthCare project", "Student Management project"],
  } }));
  await page.goto("/");
  await page.getByRole("button", { name: "Vietnamese", exact: true }).click();
  await page.getByRole("button", { name: "Mở Trợ lí AI", exact: true }).click();
  await page.getByRole("button", { name: "GitHub đang ghim những dự án nào?", exact: true }).click();
  const answer = page.locator(".portfolio-assistant__message--assistant .portfolio-assistant__answer").last();
  await expect(answer.locator("ol li")).toHaveCount(6);
  await expect(answer.locator("p")).toHaveCount(2);
  await expect(answer.locator("li").first()).toContainText("App_AI_powered_waste_sorting");
  await expect(answer.locator("li").last()).toContainText("CampusUTE");
  const positions = await answer.locator("li").evaluateAll((items) => items.map((item) => ({ top: item.getBoundingClientRect().top, bottom: item.getBoundingClientRect().bottom })));
  for (let index = 1; index < positions.length; index += 1) expect(positions[index].top - positions[index - 1].bottom).toBeGreaterThanOrEqual(10);
  expect(await answer.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("shows source-only pinned reply links and follows changed order, stale and empty snapshots", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  let repositories = pinnedSnapshot.repositories.map(({ name, fullName, href, language }) => ({ name, fullName, href, language }));
  let stale = false;
  await page.route("**/api/portfolio-assistant", async (route) => route.fulfill({ json: {
    answer: "Old model text must not replace verified inventory", sources: [],
    pinnedProjects: { source: "https://github.com/JasonTM17", summary: stale ? "Saved pins; current GitHub pins could not be rechecked." : repositories.length ? "Verified current GitHub pins." : "No public repositories are pinned.", repositories, verifiedAt: new Date().toISOString(), stale },
    references: [{ title: "View pins on GitHub", href: "https://github.com/JasonTM17" }, { title: "Unsafe link", href: "javascript:alert(1)" }],
  } }));
  await page.goto("/");
  await page.getByRole("button", { name: /open ai assistant/i }).click();
  const ask = page.getByRole("button", { name: "Which projects are pinned on GitHub?", exact: true });
  const lastReply = page.locator(".portfolio-assistant__message--assistant").last();
  await ask.click();
  const links = lastReply.locator(".portfolio-assistant__pin-list a");
  await expect(links).toHaveCount(6);
  expect(await links.evaluateAll((items) => items.map((item) => item.getAttribute("href")))).toEqual(repositories.map((repo) => repo.href));
  await expect(page.getByRole("link", { name: "Unsafe link" })).toHaveCount(0);
  await expect(page.getByText("Old model text must not replace verified inventory")).toHaveCount(0);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    const bounds = await link.boundingBox();
    expect(bounds?.height).toBeGreaterThanOrEqual(44);
  }
  repositories = repositories.slice(1).reverse();
  await ask.click();
  await expect(links).toHaveCount(5);
  expect(await links.evaluateAll((items) => items.map((item) => item.getAttribute("href")))).toEqual(repositories.map((repo) => repo.href));
  stale = true;
  await ask.click();
  await expect(lastReply).toContainText("Saved pins; current GitHub pins could not be rechecked.");
  repositories = [];
  stale = false;
  await ask.click();
  await expect(lastReply).toContainText("No public repositories are pinned.");
  await expect(links).toHaveCount(0);
  await expect(lastReply.getByRole("link", { name: /view pins on github/i })).toHaveAttribute("href", "https://github.com/JasonTM17");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /open ai assistant/i })).toBeFocused();
});

test("keeps the Vietnamese interface, chat request, and compact header in sync", async ({ page }) => {
  await page.route("**/api/portfolio-assistant", async (route) => {
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
    "Portfolio học tập của sinh viên CNTT Nguyễn Sơn về công nghệ phần mềm, DevOps, quy trình thời gian thực, ứng dụng di động và AI ứng dụng.",
  );
  await expect(page.getByText("Học có mục tiêu. Xây từng bước.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Kho dự án" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Đặt lại góc nhìn 3D" })).toBeVisible();

  await page.getByRole("button", { name: "Mở Trợ lí AI" }).click();
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
  await page.getByRole("button", { name: /open ai assistant/i }).focus();
  await expect(page.getByText("Your portfolio guide")).toBeVisible();
  await expect(page.locator(".portfolio-assistant__launcher-avatar")).toHaveCSS("animation-name", "none");
  const launcherBounds = await page.getByRole("button", { name: /open ai assistant/i }).boundingBox();
  expect(launcherBounds?.height).toBeGreaterThanOrEqual(44);
});

test("uses the static studio illustration in forced-colors mode", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/");
  await page.waitForTimeout(500);

  await expect(page.locator(".studio-scene-fallback")).toBeVisible();
  await expect(page.locator(".studio-scene-fallback")).toHaveCSS("opacity", "1");
  await expect(page.locator(".studio-scene-host canvas")).toHaveCount(0);
  await page.getByRole("button", { name: /open ai assistant/i }).focus();
  await expect(page.getByText("Your portfolio guide")).toBeVisible();
  await expect(page.locator(".portfolio-assistant__launcher-avatar")).toHaveCSS("animation-name", "none");
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
