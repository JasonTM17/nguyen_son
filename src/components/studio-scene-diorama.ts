import { Group } from "three";
import type { DisposableResource } from "./three-resource-cleanup";
import {
  addCapsule,
  addCylinder,
  addRodBetween,
  addRoundedBox,
  addSphere,
  addTorus,
  type StudioMaterials,
} from "./studio-scene-primitives";

function createMonitor(resources: DisposableResource[], materials: StudioMaterials): Group {
  const monitor = new Group();
  addRoundedBox(monitor, resources, [1.72, 1.18, 0.2], [0, 0, 0], materials.ink, 0.12);
  addRoundedBox(monitor, resources, [1.48, 0.92, 0.04], [0, 0, 0.12], materials.screen, 0.05);
  [0.27, 0.08, -0.11, -0.3].forEach((y, index) => {
    const width = [0.72, 1.05, 0.58, 0.9][index] ?? 0.7;
    const color = index % 2 === 0 ? materials.mint : materials.cobalt;
    addRoundedBox(monitor, resources, [width, 0.055, 0.025], [-0.23 + width * 0.13, y, 0.155], color, 0.02);
  });
  addRoundedBox(monitor, resources, [0.15, 0.46, 0.14], [0, -0.8, -0.02], materials.steel, 0.05);
  addRoundedBox(monitor, resources, [0.82, 0.12, 0.55], [0, -1.02, 0], materials.ink, 0.07);
  return monitor;
}

function createDesk(resources: DisposableResource[], materials: StudioMaterials): Group {
  const desk = new Group();
  addRoundedBox(desk, resources, [3.8, 0.28, 1.75], [0.7, -0.2, 0.3], materials.cream, 0.14);
  addRoundedBox(desk, resources, [0.24, 1.55, 0.24], [-0.9, -1.02, -0.3], materials.ink, 0.08);
  addRoundedBox(desk, resources, [0.24, 1.55, 0.24], [2.3, -1.02, -0.3], materials.ink, 0.08);
  addRoundedBox(desk, resources, [1.25, 1.52, 1.2], [1.72, -1.03, 0.38], materials.navy, 0.16);
  [-0.55, -0.86, -1.17].forEach((y, index) => {
    addRoundedBox(desk, resources, [0.92, 0.22, 0.08], [1.72, y, 1.02], materials.screen, 0.04);
    addSphere(desk, resources, 0.045, [1.38 + index * 0.14, y, 1.08], index === 1 ? materials.amber : materials.mint);
  });

  const primaryMonitor = createMonitor(resources, materials);
  primaryMonitor.position.set(0.95, 1.04, 0.05);
  primaryMonitor.rotation.y = -0.16;
  desk.add(primaryMonitor);

  const sideMonitor = createMonitor(resources, materials);
  sideMonitor.scale.setScalar(0.72);
  sideMonitor.position.set(2.15, 0.8, -0.12);
  sideMonitor.rotation.y = -0.48;
  desk.add(sideMonitor);

  addRoundedBox(desk, resources, [1.38, 0.09, 0.46], [0.28, 0.02, 0.98], materials.paper, 0.04, [-0.08, 0, 0]);
  [-0.42, -0.14, 0.14, 0.42].forEach((x) => {
    addRoundedBox(desk, resources, [0.18, 0.035, 0.04], [0.28 + x, 0.08, 1.18], materials.cobalt, 0.015);
  });
  addCylinder(desk, resources, 0.22, 0.48, [1.2, 0.1, 1.06], materials.indigo);
  addTorus(desk, resources, 0.22, 0.055, [1.43, 0.12, 1.06], materials.indigo, [0, 0, 0]);
  return desk;
}

function createAvatar(resources: DisposableResource[], materials: StudioMaterials): Group {
  const avatar = new Group();
  addCapsule(avatar, resources, 0.43, 0.72, [-1.45, 0.5, 0.42], materials.navy);
  addSphere(avatar, resources, 0.43, [-1.45, 1.58, 0.48], materials.skin, [0.92, 1.02, 0.92]);
  addSphere(avatar, resources, 0.38, [-1.46, 1.87, 0.43], materials.hair, [1.05, 0.55, 1]);
  addSphere(avatar, resources, 0.18, [-1.78, 1.76, 0.48], materials.hair, [1, 0.7, 0.8]);
  addSphere(avatar, resources, 0.18, [-1.15, 1.78, 0.46], materials.hair, [1, 0.65, 0.82]);
  addSphere(avatar, resources, 0.035, [-1.59, 1.61, 0.86], materials.ink);
  addSphere(avatar, resources, 0.035, [-1.31, 1.61, 0.86], materials.ink);
  addTorus(avatar, resources, 0.14, 0.022, [-1.59, 1.61, 0.84], materials.ink);
  addTorus(avatar, resources, 0.14, 0.022, [-1.31, 1.61, 0.84], materials.ink);
  addRodBetween(avatar, resources, [-1.45, 1.61, 0.84], [-1.45, 1.61, 0.87], 0.018, materials.ink);
  addTorus(avatar, resources, 0.12, 0.022, [-1.45, 1.43, 0.87], materials.coral, [0, 0, Math.PI], Math.PI);

  addCapsule(avatar, resources, 0.13, 0.67, [-1.75, -0.48, 0.43], materials.cream, [0, 0, 0.04]);
  addCapsule(avatar, resources, 0.13, 0.67, [-1.16, -0.48, 0.43], materials.cream, [0, 0, -0.04]);
  addRoundedBox(avatar, resources, [0.4, 0.16, 0.6], [-1.77, -0.94, 0.58], materials.paper, 0.08);
  addRoundedBox(avatar, resources, [0.4, 0.16, 0.6], [-1.14, -0.94, 0.58], materials.paper, 0.08);
  addRodBetween(avatar, resources, [-1.77, 0.82, 0.5], [-2.03, 0.12, 0.58], 0.12, materials.skin);
  addRodBetween(avatar, resources, [-1.13, 0.82, 0.52], [-0.72, 0.18, 0.78], 0.12, materials.skin);
  addSphere(avatar, resources, 0.14, [-2.04, 0.05, 0.6], materials.skin);
  addSphere(avatar, resources, 0.14, [-0.67, 0.1, 0.82], materials.skin);
  return avatar;
}

function createPlant(resources: DisposableResource[], materials: StudioMaterials): Group {
  const plant = new Group();
  addRoundedBox(plant, resources, [0.62, 0.52, 0.62], [-2.45, -1.55, 0.25], materials.paper, 0.12);
  [[-0.18, -0.04], [0.18, 0.02], [0, 0.18], [-0.05, -0.19]].forEach(([x, z], index) => {
    const leaf = addSphere(plant, resources, 0.24, [-2.45 + x, -1.05 + index * 0.05, 0.25 + z], materials.leaf, [0.55, 1.3, 0.42]);
    leaf.rotation.z = x < 0 ? -0.55 : 0.55;
  });
  return plant;
}

export function createStudioDiorama(resources: DisposableResource[], materials: StudioMaterials): Group {
  const diorama = new Group();
  addRoundedBox(diorama, resources, [6.6, 0.28, 4.8], [0, -2.08, 0], materials.ink, 0.2);
  addRoundedBox(diorama, resources, [6.22, 0.24, 4.42], [0, -1.88, 0], materials.paper, 0.18);
  addRoundedBox(diorama, resources, [4.5, 0.08, 2.85], [-0.42, -1.72, 0.45], materials.indigo, 0.12);
  diorama.add(createDesk(resources, materials), createAvatar(resources, materials), createPlant(resources, materials));
  return diorama;
}
