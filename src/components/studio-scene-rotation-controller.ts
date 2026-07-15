import type { Group } from "three";

const DEFAULT_ROTATION_X = 0.08;
const DEFAULT_ROTATION_Y = -0.36;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function toDegrees(value: number): string {
  return `${((value * 180) / Math.PI).toFixed(2)}deg`;
}

export function createStudioRotationController(host: HTMLElement, group: Group) {
  const sceneElement = host.closest<HTMLElement>(".studio-scene");
  let activePointerId: number | undefined;
  let currentX = DEFAULT_ROTATION_X;
  let currentY = DEFAULT_ROTATION_Y;
  let targetX = currentX;
  let targetY = currentY;
  let velocityY = 0;
  let lastX = 0;
  let lastY = 0;
  let isDragging = false;

  const syncCssState = () => {
    sceneElement?.style.setProperty("--studio-rotation-x", toDegrees(currentX));
    sceneElement?.style.setProperty("--studio-rotation-y", toDegrees(currentY));
  };

  const releasePointer = () => {
    if (activePointerId !== undefined && host.hasPointerCapture(activePointerId)) {
      host.releasePointerCapture(activePointerId);
    }
    activePointerId = undefined;
    isDragging = false;
    host.classList.remove("is-dragging");
    sceneElement?.removeAttribute("data-dragging");
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return;
    activePointerId = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    velocityY = 0;
    isDragging = true;
    host.setPointerCapture(event.pointerId);
    host.classList.add("is-dragging");
    sceneElement?.setAttribute("data-dragging", "true");
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!isDragging || event.pointerId !== activePointerId) return;
    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    targetY += deltaX * 0.0045;
    targetX = clamp(targetX + deltaY * 0.0032, -0.28, 0.34);
    velocityY = deltaX * 0.0009;
    if (event.pointerType === "touch" && Math.abs(deltaX) > Math.abs(deltaY)) event.preventDefault();
  };

  const onPointerEnd = (event: PointerEvent) => {
    if (event.pointerId === activePointerId) releasePointer();
  };

  const reset = () => {
    targetX = DEFAULT_ROTATION_X;
    targetY = DEFAULT_ROTATION_Y;
    velocityY = 0;
  };

  const rotate = (event: Event) => {
    const delta = (event as CustomEvent<{ delta?: unknown }>).detail?.delta;
    if (typeof delta !== "number" || !Number.isFinite(delta)) return;
    targetY += delta;
    velocityY = 0;
  };

  host.addEventListener("pointerdown", onPointerDown);
  host.addEventListener("pointermove", onPointerMove);
  host.addEventListener("pointerup", onPointerEnd);
  host.addEventListener("pointercancel", onPointerEnd);
  host.addEventListener("studioreset", reset);
  host.addEventListener("studiorotate", rotate);
  syncCssState();

  return {
    dispose() {
      releasePointer();
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerup", onPointerEnd);
      host.removeEventListener("pointercancel", onPointerEnd);
      host.removeEventListener("studioreset", reset);
      host.removeEventListener("studiorotate", rotate);
      sceneElement?.style.removeProperty("--studio-rotation-x");
      sceneElement?.style.removeProperty("--studio-rotation-y");
    },
    get isDragging() {
      return isDragging;
    },
    update() {
      if (!isDragging && Math.abs(velocityY) > 0.0001) {
        targetY += velocityY;
        velocityY *= 0.9;
      }
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      group.rotation.set(currentX, currentY, 0);
      syncCssState();
    },
  };
}
