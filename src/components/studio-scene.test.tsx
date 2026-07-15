import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioScene } from "./studio-scene";

const sceneRuntime = vi.hoisted(() => ({
  createStudioScene: vi.fn<(host: HTMLElement, onContextLost: () => void) => () => void>(() => {
    throw new Error("WebGL initialization failed");
  }),
}));

vi.mock("./studio-scene-runtime", () => sceneRuntime);

const defaultMatchMedia = window.matchMedia;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  sceneRuntime.createStudioScene.mockClear();
  vi.useRealTimers();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: defaultMatchMedia,
    writable: true,
  });
});

describe("StudioScene", () => {
  it("retains the fallback when renderer initialization fails", async () => {
    const { container } = render(<StudioScene reduceMotion={false} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(320);
    });

    expect(sceneRuntime.createStudioScene).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".studio-scene-fallback")).toBeInTheDocument();
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
  });

  it("does not load the renderer when motion is reduced", async () => {
    const { container } = render(<StudioScene reduceMotion />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(320);
    });

    expect(sceneRuntime.createStudioScene).not.toHaveBeenCalled();
    expect(container.querySelector(".studio-scene-fallback")).toBeInTheDocument();
  });

  it("keeps the fallback available when matchMedia is unavailable during startup", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: undefined,
      writable: true,
    });
    const { container } = render(<StudioScene reduceMotion={false} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(320);
    });

    expect(sceneRuntime.createStudioScene).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".studio-scene-fallback")).toBeInTheDocument();
  });

  it("restores the SVG fallback after a WebGL context loss", async () => {
    const runtimeCleanup = vi.fn();
    let notifyContextLoss: (() => void) | undefined;
    sceneRuntime.createStudioScene.mockImplementationOnce((_host, onContextLost) => {
      notifyContextLoss = onContextLost;
      return runtimeCleanup;
    });
    const { container } = render(<StudioScene reduceMotion={false} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(320);
    });
    expect(container.querySelector(".studio-scene")).toHaveAttribute("data-canvas-ready", "true");

    await act(async () => {
      notifyContextLoss?.();
    });

    expect(runtimeCleanup).toHaveBeenCalledOnce();
    expect(container.querySelector(".studio-scene")).toHaveAttribute("data-canvas-ready", "false");
  });

  it("offers an explicit control for the interactive 3D view", async () => {
    sceneRuntime.createStudioScene.mockImplementationOnce(() => vi.fn());
    const { container } = render(<StudioScene reduceMotion={false} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(320);
    });
    const control = screen.getByRole("button", { name: "Interact with 3D" });
    fireEvent.click(control);

    expect(control).toHaveAccessibleName("Reset 3D view");
    expect(screen.getByText("Drag the studio to orbit. Reset to rest.")).toBeInTheDocument();
    expect(container.querySelector(".studio-scene")).toHaveAttribute("data-interactive", "true");
  });
});
