import { useEffect, useRef, useState, type ReactNode } from "react";
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

  const rotateStudio = (delta: number) => {
    hostRef.current?.dispatchEvent(new CustomEvent("studiorotate", { detail: { delta } }));
  };

  return (
    <div className="studio-scene" data-canvas-ready={canvasReady}>
      <img alt="" className="studio-scene__portrait" src="/nguyen-son-studio-avatar-clean.png" />
      <StudioSceneFallback />
      <div aria-hidden="true" className="studio-scene-host" ref={hostRef} />
      {!disabled && canvasReady && (
        <div className="studio-scene__interaction">
          <div aria-label={copy.controlsLabel} className="studio-scene__controls" role="group">
            <StudioControl label={copy.rotateLeft} onClick={() => rotateStudio(-0.42)}>
              <RotationArrow direction="left" />
            </StudioControl>
            <StudioControl
              label={copy.reset}
              onClick={() => hostRef.current?.dispatchEvent(new Event("studioreset"))}
              wide
            >
              {copy.reset}
            </StudioControl>
            <StudioControl label={copy.rotateRight} onClick={() => rotateStudio(0.42)}>
              <RotationArrow direction="right" />
            </StudioControl>
          </div>
          <p className="studio-scene__interaction-hint" id="studio-scene-interaction-hint">
            {copy.dragHint}
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

type StudioControlProps = {
  readonly children: ReactNode;
  readonly label: string;
  readonly onClick: () => void;
  readonly wide?: boolean;
};

function StudioControl({ children, label, onClick, wide = false }: StudioControlProps) {
  return (
    <button
      aria-describedby="studio-scene-interaction-hint"
      aria-label={label}
      className={`studio-scene__control${wide ? " studio-scene__control--wide" : ""}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function RotationArrow({ direction }: { readonly direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className={direction === "right" ? "studio-scene__arrow studio-scene__arrow--right" : "studio-scene__arrow"}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M8.2 7.2 3.4 12l4.8 4.8M4 12h8.5a6.5 6.5 0 1 1 0 13"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}
