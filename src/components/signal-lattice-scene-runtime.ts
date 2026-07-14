import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  DirectionalLight,
  Euler,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import {
  disposeRenderer,
  disposeResources,
  type DisposableResource,
} from "./signal-lattice-resource-cleanup";

function createNodePositions(count: number): Vector3[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const radius = 1.65 + (index % 4) * 0.3;
    const depth = ((index % 5) - 2) * 0.3;
    return new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.72, depth);
  });
}

function createConnectionPoints(nodes: readonly Vector3[]): Vector3[] {
  return nodes.flatMap((node, index) => {
    const nextNode = nodes[(index + 5) % nodes.length];
    return index % 2 === 0 ? [node, nextNode] : [];
  });
}

function clamp(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function matchesMediaQuery(query: string): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(query).matches;
}

export function createSignalLatticeScene(
  host: HTMLElement,
  onContextLost: () => void,
): () => void {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  const resources: DisposableResource[] = [];
  let cleanup: (() => void) | undefined;

  try {
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.tabIndex = -1;
    renderer.domElement.style.pointerEvents = "none";

    const scene = new Scene();
    const camera = new PerspectiveCamera(34, 1, 0.1, 40);
    const group = new Group();
    const coreGeometry = new IcosahedronGeometry(1.04, 1);
    resources.push(coreGeometry);
    const coreMaterial = new MeshStandardMaterial({ color: 0xffbc71, metalness: 0.2, roughness: 0.5 });
    resources.push(coreMaterial);
    const core = new Mesh(coreGeometry, coreMaterial);
    const boxGeometry = new BoxGeometry(0.13, 0.13, 0.13);
    resources.push(boxGeometry);
    const nodeMaterial = new MeshStandardMaterial({ color: 0x63d9c9, emissive: 0x103c3b, roughness: 0.6 });
    resources.push(nodeMaterial);
    const nodeCount = matchesMediaQuery("(max-width: 767px)") ? 12 : 28;
    const nodes = createNodePositions(nodeCount);
    const instances = new InstancedMesh(boxGeometry, nodeMaterial, nodeCount);
    const matrix = new Matrix4();
    const rotation = new Quaternion();
    const scale = new Vector3(1, 1, 1);
    const lineGeometry = new BufferGeometry().setFromPoints(createConnectionPoints(nodes));
    resources.push(lineGeometry);
    const lineMaterial = new LineBasicMaterial({ color: 0x63d9c9, opacity: 0.35, transparent: true });
    resources.push(lineMaterial);
    const lines = new LineSegments(lineGeometry, lineMaterial);

    nodes.forEach((position, index) => {
      rotation.setFromEuler(new Euler(index * 0.2, index * 0.35, 0));
      matrix.compose(position, rotation, scale);
      instances.setMatrixAt(index, matrix);
    });
    instances.instanceMatrix.needsUpdate = true;

    const ambientLight = new AmbientLight(0xf3f7fb, 1.5);
    const directionalLight = new DirectionalLight(0xffbc71, 2.2);
    directionalLight.position.set(2, 3, 5);
    scene.add(ambientLight, directionalLight, group);
    group.add(core, instances, lines);
    camera.position.set(0, 0, 8);

    let frame: number | undefined;
    let inViewport = true;
    let visible = !document.hidden;
    let pointerX = 0;
    let pointerY = 0;

    const render = () => {
      if (!visible || !inViewport) return;

      group.rotation.set(pointerY * 0.07, pointerX * 0.07, 0);
      camera.position.set(pointerX * 0.35, pointerY * -0.2, 8);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    const requestRender = () => {
      if (!visible || !inViewport || frame !== undefined) return;

      frame = window.requestAnimationFrame(() => {
        frame = undefined;
        render();
      });
    };

    const resize = () => {
      const { height, width } = host.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.25 : 1.5));
      renderer.setSize(width, height, false);
      requestRender();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!matchesMediaQuery("(pointer: fine)")) return;

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
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      scene.remove(ambientLight, directionalLight, group);
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
    if (cleanup) {
      cleanup();
    } else {
      disposeResources(resources);
      disposeRenderer(renderer);
    }
    throw error;
  }
}
