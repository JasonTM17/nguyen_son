import { Group } from "three";
import type { DisposableResource } from "./three-resource-cleanup";
import { createStudioDiorama } from "./studio-scene-diorama";
import { createStudioMascots } from "./studio-scene-mascots";
import { createStudioMaterials, enableStudioShadows } from "./studio-scene-primitives";

type StudioAssets = {
  readonly animate: (time: number) => void;
  readonly group: Group;
  readonly resources: DisposableResource[];
};

export function createStudioObjects(compact: boolean): StudioAssets {
  const resources: DisposableResource[] = [];
  const materials = createStudioMaterials(resources);
  const group = new Group();
  const diorama = createStudioDiorama(resources, materials);
  const mascots = createStudioMascots(resources, materials, compact);

  group.add(diorama, mascots.group);
  group.scale.setScalar(compact ? 0.78 : 0.88);
  group.position.y = compact ? -0.22 : -0.12;
  enableStudioShadows(group);

  return {
    group,
    resources,
    animate: mascots.animate,
  };
}
