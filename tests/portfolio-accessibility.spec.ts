import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

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

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
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
