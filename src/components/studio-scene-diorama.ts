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

  addRoundedBox(desk, resources, [0.72, 0.16, 0.72], [-0.35, 0.02, 0.28], materials.ink, 0.08);
  addRoundedBox(desk, resources, [0.54, 0.12, 0.54], [-0.35, 0.16, 0.28], materials.cobalt, 0.07);
  addRoundedBox(desk, resources, [0.34, 0.34, 0.34], [-0.35, 0.39, 0.28], materials.teal, 0.07, [0, 0.42, 0]);
  addRoundedBox(desk, resources, [0.19, 0.19, 0.19], [-0.35, 0.39, 0.47], materials.mint, 0.04, [0, 0.42, 0]);
  return desk;
}

function createAvatar(resources: DisposableResource[], materials: StudioMaterials): Group {
  const avatar = new Group();
  addCylinder(avatar, resources, 0.15, 0.2, [-1.5, 1.1, 0.5], materials.skin);
  addRoundedBox(avatar, resources, [0.94, 1.08, 0.64], [-1.5, 0.52, 0.48], materials.navy, 0.25);
  addRoundedBox(avatar, resources, [0.78, 0.34, 0.56], [-1.5, -0.15, 0.47], materials.cream, 0.13);
  addRoundedBox(avatar, resources, [0.26, 0.08, 0.08], [-1.67, 1.01, 0.82], materials.paper, 0.025, [0, 0, -0.45]);
  addRoundedBox(avatar, resources, [0.26, 0.08, 0.08], [-1.33, 1.01, 0.82], materials.paper, 0.025, [0, 0, 0.45]);
  [0.76, 0.57].forEach((y) => addSphere(avatar, resources, 0.035, [-1.5, y, 0.82], materials.paper));

  addSphere(avatar, resources, 0.43, [-1.5, 1.58, 0.54], materials.skin, [0.92, 1.02, 0.92]);
  addSphere(avatar, resources, 0.38, [-1.51, 1.89, 0.47], materials.hair, [1.06, 0.56, 1]);
  addSphere(avatar, resources, 0.2, [-1.84, 1.76, 0.5], materials.hair, [1, 0.72, 0.86]);
  addSphere(avatar, resources, 0.18, [-1.18, 1.79, 0.49], materials.hair, [1, 0.68, 0.84]);
  addSphere(avatar, resources, 0.04, [-1.64, 1.61, 0.92], materials.ink);
  addSphere(avatar, resources, 0.04, [-1.36, 1.61, 0.92], materials.ink);
  addTorus(avatar, resources, 0.14, 0.023, [-1.64, 1.61, 0.89], materials.ink);
  addTorus(avatar, resources, 0.14, 0.023, [-1.36, 1.61, 0.89], materials.ink);
  addRodBetween(avatar, resources, [-1.5, 1.61, 0.89], [-1.5, 1.61, 0.93], 0.018, materials.ink);
  addSphere(avatar, resources, 0.045, [-1.5, 1.52, 0.96], materials.skin, [0.8, 1.1, 0.65]);
  addTorus(avatar, resources, 0.12, 0.022, [-1.5, 1.42, 0.93], materials.coral, [0, 0, Math.PI], Math.PI);

  addCapsule(avatar, resources, 0.14, 0.64, [-1.76, -0.66, 0.47], materials.cream, [0, 0, 0.03]);
  addCapsule(avatar, resources, 0.14, 0.64, [-1.24, -0.66, 0.47], materials.cream, [0, 0, -0.03]);
  addRoundedBox(avatar, resources, [0.43, 0.17, 0.64], [-1.78, -1.07, 0.64], materials.paper, 0.09);
  addRoundedBox(avatar, resources, [0.43, 0.17, 0.64], [-1.22, -1.07, 0.64], materials.paper, 0.09);
  addSphere(avatar, resources, 0.2, [-1.93, 0.82, 0.5], materials.navy, [1, 0.85, 1]);
  addSphere(avatar, resources, 0.2, [-1.07, 0.82, 0.5], materials.navy, [1, 0.85, 1]);
  addRodBetween(avatar, resources, [-1.94, 0.72, 0.53], [-2.1, 0.12, 0.68], 0.115, materials.skin);
  addRodBetween(avatar, resources, [-1.06, 0.72, 0.55], [-0.73, 0.16, 0.86], 0.115, materials.skin);
  addSphere(avatar, resources, 0.14, [-2.11, 0.06, 0.7], materials.skin);
  addSphere(avatar, resources, 0.14, [-0.69, 0.1, 0.9], materials.skin);
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
  addRoundedBox(diorama, resources, [6.7, 0.42, 4.9], [0, -2.16, 0], materials.ink, 0.23);
  addRoundedBox(diorama, resources, [6.36, 0.26, 4.55], [0, -1.9, 0], materials.paper, 0.2);
  addRoundedBox(diorama, resources, [5.9, 0.1, 4.1], [0, -1.72, 0.08], materials.cream, 0.16);
  addRoundedBox(diorama, resources, [4.5, 0.08, 2.85], [-0.42, -1.72, 0.45], materials.indigo, 0.12);
  diorama.add(createDesk(resources, materials), createAvatar(resources, materials), createPlant(resources, materials));
  return diorama;
}
