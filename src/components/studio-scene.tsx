import { useEffect, useRef, useState } from "react";
import { useForcedColors } from "../hooks/use-forced-colors";
import { portfolioCopy, type PortfolioCopy } from "../i18n/portfolio-copy";
import { usePortfolioLanguage } from "../i18n/portfolio-language-context";
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
  const { language } = usePortfolioLanguage();

  return (
    <StudioSceneInstance
      copy={portfolioCopy[language].studio}
      disabled={reduceMotion || forcedColors}
      key={`${reduceMotion}-${forcedColors}`}
    />
  );
}

type StudioSceneInstanceProps = {
  readonly copy: PortfolioCopy["studio"];
  readonly disabled: boolean;
};

function StudioSceneInstance({ copy, disabled }: StudioSceneInstanceProps) {
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
        <div className="studio-scene__interaction">
          <button
            aria-describedby="studio-scene-interaction-hint"
            aria-pressed={isInteractive}
            className="studio-scene__control"
            onClick={toggleInteraction}
            type="button"
          >
            {isInteractive ? copy.reset : copy.interact}
          </button>
          <p className="studio-scene__interaction-hint" id="studio-scene-interaction-hint">
            {isInteractive ? copy.resetHint : copy.enableHint}
          </p>
        </div>
      )}
      <div aria-hidden="true" className="studio-scene__meta">
        <span>{copy.meta[0]}</span>
        <span>{copy.meta[1]}</span>
      </div>
    </div>
  );
}
