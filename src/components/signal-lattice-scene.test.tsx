import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignalLatticeScene } from "./signal-lattice-scene";

const sceneRuntime = vi.hoisted(() => ({
  createSignalLatticeScene: vi.fn<
    (host: HTMLElement, onContextLost: () => void) => () => void
  >(() => {
    throw new Error("WebGL initialization failed");
  }),
}));

vi.mock("./signal-lattice-scene-runtime", () => sceneRuntime);

const defaultMatchMedia = window.matchMedia;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  sceneRuntime.createSignalLatticeScene.mockClear();
  vi.useRealTimers();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: defaultMatchMedia,
    writable: true,
  });
});

describe("SignalLatticeScene", () => {
  it("retains the fallback when renderer initialization fails", async () => {
    const { container } = render(<SignalLatticeScene reduceMotion={false} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(320);
    });

    expect(sceneRuntime.createSignalLatticeScene).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".signal-lattice-fallback")).toBeInTheDocument();
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
  });

  it("does not load the renderer when motion is reduced", async () => {
    const { container } = render(<SignalLatticeScene reduceMotion />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(320);
    });

    expect(sceneRuntime.createSignalLatticeScene).not.toHaveBeenCalled();
    expect(container.querySelector(".signal-lattice-fallback")).toBeInTheDocument();
  });

  it("keeps the fallback available when matchMedia is unavailable during startup", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: undefined,
      writable: true,
    });
    const { container } = render(<SignalLatticeScene reduceMotion={false} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(320);
    });

    expect(sceneRuntime.createSignalLatticeScene).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".signal-lattice-fallback")).toBeInTheDocument();
  });

  it("restores the SVG fallback after a WebGL context loss", async () => {
    const runtimeCleanup = vi.fn();
    let notifyContextLoss: (() => void) | undefined;
    sceneRuntime.createSignalLatticeScene.mockImplementationOnce((_host, onContextLost) => {
      notifyContextLoss = onContextLost;
      return runtimeCleanup;
    });
    const { container } = render(<SignalLatticeScene reduceMotion={false} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(320);
    });
    expect(container.querySelector(".signal-lattice")).toHaveAttribute("data-canvas-ready", "true");

    await act(async () => {
      notifyContextLoss?.();
    });

    expect(runtimeCleanup).toHaveBeenCalledOnce();
    expect(container.querySelector(".signal-lattice")).toHaveAttribute("data-canvas-ready", "false");
  });
});
