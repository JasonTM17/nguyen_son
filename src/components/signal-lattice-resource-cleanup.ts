import type { WebGLRenderer } from "three";

export type DisposableResource = {
  dispose: () => void;
};

export function disposeResources(resources: readonly DisposableResource[]): void {
  for (const resource of resources) resource.dispose();
}

export function disposeRenderer(renderer: WebGLRenderer): void {
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement.remove();
}
