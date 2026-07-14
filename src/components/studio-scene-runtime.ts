import {
  AmbientLight,
  DirectionalLight,
  OrthographicCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { createStudioObjects } from "./studio-scene-objects";
import { disposeRenderer, disposeResources } from "./three-resource-cleanup";

function clamp(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function matchesMediaQuery(query: string): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(query).matches;
}

export function createStudioScene(host: HTMLElement, onContextLost: () => void): () => void {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  let cleanup: (() => void) | undefined;
  let resources: ReturnType<typeof createStudioObjects>["resources"] = [];

  try {
    const studio = createStudioObjects(matchesMediaQuery("(max-width: 767px)"));
    const animateIcons = matchesMediaQuery("(pointer: fine)");
    resources = studio.resources;
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.tabIndex = -1;
    renderer.domElement.style.pointerEvents = "none";

    const scene = new Scene();
    const camera = new OrthographicCamera(-4, 4, 3, -3, 0.1, 40);
    const ambientLight = new AmbientLight(0xfffaf2, 2.25);
    const keyLight = new DirectionalLight(0xffffff, 2.3);
    const warmLight = new DirectionalLight(0xffb45d, 0.7);
    keyLight.position.set(3, 5, 5);
    warmLight.position.set(-4, 2, 3);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    scene.add(ambientLight, keyLight, warmLight, studio.group);

    let frame: number | undefined;
    let animationTimer: number | undefined;
    let inViewport = true;
    let visible = !document.hidden;
    let pointerX = 0;
    let pointerY = 0;

    const render = (time: number) => {
      if (!visible || !inViewport) return;
      studio.animate(animateIcons ? time : 0);
      studio.group.rotation.set(pointerY * 0.025, pointerX * 0.035, 0);
      renderer.render(scene, camera);
    };

    const scheduleAnimation = () => {
      if (!animateIcons || !visible || !inViewport || animationTimer !== undefined) return;
      animationTimer = window.setTimeout(() => {
        animationTimer = undefined;
        requestRender();
      }, 70);
    };

    const requestRender = () => {
      if (!visible || !inViewport || frame !== undefined) return;
      frame = window.requestAnimationFrame((time) => {
        frame = undefined;
        render(time);
        scheduleAnimation();
      });
    };

    const resize = () => {
      const { height, width } = host.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const aspect = width / height;
      const viewSize = aspect < 1 ? 4.85 : 4.25;
      camera.left = -viewSize * aspect;
      camera.right = viewSize * aspect;
      camera.top = viewSize;
      camera.bottom = -viewSize;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 768 ? 1.25 : 1.5));
      renderer.setSize(width, height, false);
      requestRender();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!animateIcons) return;
      const { height, left, top, width } = host.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      pointerX = clamp(((event.clientX - left) / width) * 2 - 1);
      pointerY = clamp(((event.clientY - top) / height) * 2 - 1);
      requestRender();
    };

    const onPointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
      requestRender();
    };

    const onVisibilityChange = () => {
      visible = !document.hidden;
      if (visible) requestRender();
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };

    const intersectionObserver =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver(([entry]) => {
            inViewport = Boolean(entry?.isIntersecting);
            if (inViewport) requestRender();
          });
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => resize());

    cleanup = () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      if (animationTimer !== undefined) window.clearTimeout(animationTimer);
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      scene.remove(ambientLight, keyLight, warmLight, studio.group);
      disposeResources(resources);
      disposeRenderer(renderer);
    };

    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
    host.append(renderer.domElement);
    intersectionObserver?.observe(host);
    resizeObserver?.observe(host);
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("resize", resize);
    resize();

    return cleanup;
  } catch (error) {
    if (cleanup) cleanup();
    else {
      disposeResources(resources);
      disposeRenderer(renderer);
    }
    throw error;
  }
}
