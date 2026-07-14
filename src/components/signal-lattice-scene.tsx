import { useEffect, useRef, useState } from "react";
import { useForcedColors } from "../hooks/use-forced-colors";
import { SignalLatticeFallback } from "./signal-lattice-fallback";

type SignalLatticeSceneProps = {
  readonly reduceMotion: boolean;
};

type IdleWindow = Window & {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
};

function scheduleIdleTask(task: () => void): () => void {
  const idleWindow = window as IdleWindow;
  const idleHandle = idleWindow.requestIdleCallback?.(task, { timeout: 1000 });

  if (idleHandle !== undefined) {
    return () => idleWindow.cancelIdleCallback?.(idleHandle);
  }

  const timeoutHandle = window.setTimeout(task, 320);
  return () => window.clearTimeout(timeoutHandle);
}

export function SignalLatticeScene({ reduceMotion }: SignalLatticeSceneProps) {
  const forcedColors = useForcedColors();

  return (
    <SignalLatticeInstance
      disabled={reduceMotion || forcedColors}
      key={`${reduceMotion}-${forcedColors}`}
    />
  );
}

type SignalLatticeInstanceProps = {
  readonly disabled: boolean;
};

function SignalLatticeInstance({ disabled }: SignalLatticeInstanceProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    if (disabled || !hostRef.current) return;

    const host = hostRef.current;
    let active = true;
    let contextLostDuringSetup = false;
    let sceneCleanup: (() => void) | undefined;

    const handleContextLost = () => {
      if (!active) return;

      contextLostDuringSetup = true;
      sceneCleanup?.();
      sceneCleanup = undefined;
      setCanvasReady(false);
    };

    const startScene = async () => {
      if (!active || startedRef.current) return;

      startedRef.current = true;
      try {
        const { createSignalLatticeScene } = await import("./signal-lattice-scene-runtime");
        if (!active) return;

        sceneCleanup = createSignalLatticeScene(host, handleContextLost);
        if (contextLostDuringSetup) {
          sceneCleanup();
          sceneCleanup = undefined;
          return;
        }

        setCanvasReady(true);
      } catch {
        // The inline SVG remains visible because this visual is optional.
        startedRef.current = false;
      }
    };

    const observer =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver(
            ([entry]) => {
              if (entry?.isIntersecting) void startScene();
            },
            { rootMargin: "160px" },
          );

    observer?.observe(host);
    const cancelIdleTask = scheduleIdleTask(() => void startScene());

    return () => {
      active = false;
      observer?.disconnect();
      cancelIdleTask();
      sceneCleanup?.();
      startedRef.current = false;
    };
  }, [disabled]);

  return (
    <div className="signal-lattice" data-canvas-ready={canvasReady}>
      <SignalLatticeFallback />
      <div aria-hidden="true" className="signal-lattice-host" ref={hostRef} />
    </div>
  );
}
