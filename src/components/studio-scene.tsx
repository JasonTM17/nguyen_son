import { useEffect, useRef, useState } from "react";
import { useForcedColors } from "../hooks/use-forced-colors";
import { StudioSceneFallback } from "./studio-scene-fallback";

type StudioSceneProps = {
  readonly reduceMotion: boolean;
};

type IdleWindow = Window & {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
};

function scheduleIdleTask(task: () => void): () => void {
  const idleWindow = window as IdleWindow;
  const idleHandle = idleWindow.requestIdleCallback?.(task, { timeout: 1000 });

  if (idleHandle !== undefined) return () => idleWindow.cancelIdleCallback?.(idleHandle);

  const timeoutHandle = window.setTimeout(task, 320);
  return () => window.clearTimeout(timeoutHandle);
}

export function StudioScene({ reduceMotion }: StudioSceneProps) {
  const forcedColors = useForcedColors();
  return <StudioSceneInstance disabled={reduceMotion || forcedColors} key={`${reduceMotion}-${forcedColors}`} />;
}

type StudioSceneInstanceProps = {
  readonly disabled: boolean;
};

function StudioSceneInstance({ disabled }: StudioSceneInstanceProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

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
        const { createStudioScene } = await import("./studio-scene-runtime");
        if (!active) return;
        sceneCleanup = createStudioScene(host, handleContextLost);
        if (contextLostDuringSetup) {
          sceneCleanup();
          sceneCleanup = undefined;
          return;
        }
        setCanvasReady(true);
      } catch {
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

  const toggleInteraction = () => {
    const nextInteractiveState = !isInteractive;
    setIsInteractive(nextInteractiveState);
    if (!nextInteractiveState) hostRef.current?.dispatchEvent(new Event("studioreset"));
  };

  return (
    <div className="studio-scene" data-canvas-ready={canvasReady} data-interactive={isInteractive}>
      <img
        alt=""
        className="studio-scene__portrait"
        src="/nguyen-son-studio-avatar-clean.png"
      />
      <StudioSceneFallback />
      <div aria-hidden="true" className="studio-scene-host" data-interactive={isInteractive} ref={hostRef} />
      {!disabled && canvasReady && (
        <button
          aria-pressed={isInteractive}
          className="studio-scene__control"
          onClick={toggleInteraction}
          type="button"
        >
          {isInteractive ? "Reset 3D view" : "Interact with 3D"}
        </button>
      )}
      <div aria-hidden="true" className="studio-scene__meta">
        <span>Nguyen Son / systems studio</span>
        <span>Software engineering + DevOps</span>
      </div>
    </div>
  );
}
