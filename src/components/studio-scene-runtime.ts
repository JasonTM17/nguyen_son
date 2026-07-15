import {
  ACESFilmicToneMapping,
  DirectionalLight,
  HemisphereLight,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { createStudioObjects } from "./studio-scene-objects";
import { createStudioRotationController } from "./studio-scene-rotation-controller";
import { disposeRenderer, disposeResources } from "./three-resource-cleanup";

function matchesMediaQuery(query: string): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(query).matches;
}

export function createStudioScene(host: HTMLElement, onContextLost: () => void): () => void {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  let cleanup: (() => void) | undefined;
  let resources: ReturnType<typeof createStudioObjects>["resources"] = [];

  try {
    const compact = matchesMediaQuery("(max-width: 767px)");
    const studio = createStudioObjects(compact);
    const sceneElement = host.closest<HTMLElement>(".studio-scene");
    resources = studio.resources;

    renderer.outputColorSpace = SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.tabIndex = -1;
    renderer.domElement.style.pointerEvents = "none";

    const scene = new Scene();
    const camera = new PerspectiveCamera(31, 1, 0.1, 50);
    const skyLight = new HemisphereLight(0xfffbf3, 0x8a7662, 2.15);
    const keyLight = new DirectionalLight(0xffffff, 3.15);
    const warmLight = new DirectionalLight(0xffc37b, 1.25);
    keyLight.position.set(5, 8, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 28;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    warmLight.position.set(-5, 2, 4);
    camera.position.set(0, 0.75, compact ? 14.8 : 14.2);
    camera.lookAt(0, -0.15, 0);
    scene.add(skyLight, keyLight, warmLight, studio.group);

    const rotationController = createStudioRotationController(host, studio.group);
    const frameInterval = 1000 / (compact ? 30 : 45);
    let frame: number | undefined;
    let inViewport = true;
    let lastRenderTime = 0;
    let visible = !document.hidden;

    const tick = (time: number) => {
      frame = undefined;
      if (!visible || !inViewport) return;
      if (time - lastRenderTime >= frameInterval) {
        lastRenderTime = time;
        rotationController.update();
        studio.animate(time);
        renderer.render(scene, camera);
      }
      frame = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!visible || !inViewport || frame !== undefined) return;
      frame = window.requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (frame === undefined) return;
      window.cancelAnimationFrame(frame);
      frame = undefined;
    };

    const resize = () => {
      const { height, width } = host.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 768 ? 1.2 : 1.55));
      renderer.setSize(width, height, false);
      rotationController.update();
      studio.animate(performance.now());
      renderer.render(scene, camera);
      startLoop();
    };

    const onVisibilityChange = () => {
      visible = !document.hidden;
      if (visible) startLoop();
      else stopLoop();
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };

    const intersectionObserver = typeof IntersectionObserver === "undefined"
      ? undefined
      : new IntersectionObserver(([entry]) => {
          inViewport = Boolean(entry?.isIntersecting);
          if (inViewport) startLoop();
          else stopLoop();
        });
    const resizeObserver = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(resize);

    cleanup = () => {
      stopLoop();
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
      rotationController.dispose();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      scene.remove(skyLight, keyLight, warmLight, studio.group);
      sceneElement?.removeAttribute("data-scene-mode");
      disposeResources(resources);
      disposeRenderer(renderer);
    };

    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
    host.append(renderer.domElement);
    sceneElement?.setAttribute("data-scene-mode", "hybrid-artwork-3d");
    intersectionObserver?.observe(host);
    resizeObserver?.observe(host);
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
