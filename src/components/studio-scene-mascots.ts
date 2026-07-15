import { ConeGeometry, Group, Mesh, Vector3 } from "three";
import type { DisposableResource } from "./three-resource-cleanup";
import {
  addCylinder,
  addRodBetween,
  addRoundedBox,
  addSphere,
  addTorus,
  type StudioMaterials,
  type Vector,
} from "./studio-scene-primitives";

type FloatingMascot = {
  readonly amplitude: number;
  readonly base: Vector3;
  readonly phase: number;
  readonly visual: Group;
};

function addFace(
  parent: Group,
  resources: DisposableResource[],
  materials: StudioMaterials,
  position: Vector,
  scale = 1,
): void {
  addSphere(parent, resources, 0.045 * scale, [position[0] - 0.1 * scale, position[1], position[2]], materials.ink);
  addSphere(parent, resources, 0.045 * scale, [position[0] + 0.1 * scale, position[1], position[2]], materials.ink);
  addTorus(
    parent,
    resources,
    0.12 * scale,
    0.022 * scale,
    [position[0], position[1] - 0.1 * scale, position[2]],
    materials.ink,
    [0, 0, Math.PI],
    Math.PI,
  );
}

function createCloud(resources: DisposableResource[], materials: StudioMaterials): Group {
  const icon = new Group();
  addSphere(icon, resources, 0.3, [-0.26, -0.05, 0], materials.mint);
  addSphere(icon, resources, 0.4, [0.02, 0.1, 0.02], materials.mint);
  addSphere(icon, resources, 0.27, [0.35, -0.06, 0], materials.mint);
  addRoundedBox(icon, resources, [0.96, 0.25, 0.38], [0.02, -0.24, 0], materials.mint, 0.12);
  addCylinder(icon, resources, 0.055, 0.48, [0.02, 0.68, 0], materials.amber);
  const coneGeometry = new ConeGeometry(0.18, 0.28, 5);
  const cone = new Mesh(coneGeometry, materials.amber);
  cone.position.set(0.02, 1.02, 0);
  icon.add(cone);
  resources.push(coneGeometry);
  addFace(icon, resources, materials, [0.02, -0.04, 0.31], 0.82);
  return icon;
}

function createTerminal(resources: DisposableResource[], materials: StudioMaterials): Group {
  const icon = new Group();
  addRoundedBox(icon, resources, [1.18, 0.86, 0.3], [0, 0, 0], materials.indigo, 0.13);
  addRoundedBox(icon, resources, [0.93, 0.62, 0.045], [0, 0, 0.18], materials.screen, 0.07);
  addRoundedBox(icon, resources, [0.18, 0.055, 0.03], [-0.28, -0.2, 0.22], materials.mint, 0.02, [0, 0, -0.55]);
  addRoundedBox(icon, resources, [0.3, 0.055, 0.03], [0.18, -0.2, 0.22], materials.amber, 0.02);
  addFace(icon, resources, materials, [0, 0.12, 0.23]);
  return icon;
}

function createDatabase(resources: DisposableResource[], materials: StudioMaterials): Group {
  const icon = new Group();
  addCylinder(icon, resources, 0.43, 0.72, [0, 0, 0], materials.teal);
  [0.26, 0, -0.26].forEach((y, index) => {
    addTorus(icon, resources, 0.43, 0.042, [0, y, 0], index === 1 ? materials.amber : materials.paper, [Math.PI / 2, 0, 0]);
  });
  addFace(icon, resources, materials, [0, 0.06, 0.43], 0.8);
  return icon;
}

function createCodeCube(resources: DisposableResource[], materials: StudioMaterials): Group {
  const icon = new Group();
  addRoundedBox(icon, resources, [0.92, 0.92, 0.92], [0, 0, 0], materials.cobalt, 0.18, [0.08, -0.18, 0.03]);
  const leftTop = addRoundedBox(icon, resources, [0.09, 0.33, 0.08], [-0.23, 0.14, 0.52], materials.paper, 0.03);
  leftTop.rotation.z = 0.58;
  const leftBottom = addRoundedBox(icon, resources, [0.09, 0.33, 0.08], [-0.23, -0.14, 0.52], materials.paper, 0.03);
  leftBottom.rotation.z = -0.58;
  const rightTop = addRoundedBox(icon, resources, [0.09, 0.33, 0.08], [0.23, 0.14, 0.52], materials.mint, 0.03);
  rightTop.rotation.z = -0.58;
  const rightBottom = addRoundedBox(icon, resources, [0.09, 0.33, 0.08], [0.23, -0.14, 0.52], materials.mint, 0.03);
  rightBottom.rotation.z = 0.58;
  return icon;
}

function createGitBranch(resources: DisposableResource[], materials: StudioMaterials): Group {
  const icon = new Group();
  addRodBetween(icon, resources, [-0.28, -0.4, 0], [-0.28, 0.4, 0], 0.055, materials.coral);
  addRodBetween(icon, resources, [-0.28, 0.12, 0], [0.3, 0.38, 0], 0.055, materials.coral);
  [[-0.28, -0.4], [-0.28, 0.12], [-0.28, 0.4], [0.3, 0.38]].forEach(([x, y], index) => {
    addSphere(icon, resources, index === 1 ? 0.13 : 0.11, [x, y, 0], index === 1 ? materials.amber : materials.paper);
  });
  addFace(icon, resources, materials, [0.3, 0.38, 0.13], 0.55);
  return icon;
}

function createJavaCup(resources: DisposableResource[], materials: StudioMaterials): Group {
  const icon = new Group();
  addCylinder(icon, resources, 0.36, 0.58, [0, -0.05, 0], materials.paper);
  addTorus(icon, resources, 0.28, 0.07, [0.37, -0.04, 0], materials.paper);
  addRoundedBox(icon, resources, [0.48, 0.07, 0.04], [0, 0.02, 0.37], materials.coral, 0.02);
  addTorus(icon, resources, 0.16, 0.025, [-0.12, 0.52, 0], materials.mint, [0, 0, 0.4], Math.PI * 1.3);
  addTorus(icon, resources, 0.16, 0.025, [0.15, 0.72, 0], materials.amber, [0, 0, 0.4], Math.PI * 1.3);
  addFace(icon, resources, materials, [0, -0.04, 0.37], 0.72);
  return icon;
}

function createContainer(resources: DisposableResource[], materials: StudioMaterials): Group {
  const icon = new Group();
  addRoundedBox(icon, resources, [1.04, 0.78, 0.72], [0, 0, 0], materials.navy, 0.14, [0.05, -0.24, 0]);
  [-0.3, -0.1, 0.1, 0.3].forEach((x) => {
    addRoundedBox(icon, resources, [0.045, 0.5, 0.025], [x, 0, 0.39], materials.cobalt, 0.015);
  });
  addFace(icon, resources, materials, [0, 0.03, 0.4], 0.82);
  return icon;
}

function createAiOrb(resources: DisposableResource[], materials: StudioMaterials): Group {
  const icon = new Group();
  addSphere(icon, resources, 0.38, [0, 0, 0], materials.amber);
  const satellites: Vector[] = [[-0.58, 0.22, 0], [0.5, 0.42, 0], [0.56, -0.34, 0], [-0.38, -0.5, 0]];
  satellites.forEach((position, index) => {
    addRodBetween(icon, resources, [0, 0, 0], position, 0.035, materials.steel);
    addSphere(icon, resources, 0.11, position, index % 2 ? materials.mint : materials.cobalt);
  });
  addFace(icon, resources, materials, [0, 0.04, 0.38], 0.75);
  return icon;
}

export function createStudioMascots(
  resources: DisposableResource[],
  materials: StudioMaterials,
  compact: boolean,
): { animate: (time: number) => void; group: Group } {
  const group = new Group();
  const definitions: readonly [Group, Vector, number][] = [
    [createCloud(resources, materials), [-3.25, 2.22, -0.4], 0.2],
    [createTerminal(resources, materials), [3.2, 2.02, 0.55], 1.2],
    [createDatabase(resources, materials), [3.28, -1.28, 0.45], 2.1],
    [createCodeCube(resources, materials), [-3.24, -1.18, 0.35], 2.9],
    [createGitBranch(resources, materials), [-2.82, 0.65, -1.38], 3.7],
    [createJavaCup(resources, materials), [2.72, 3.02, -1.35], 4.5],
    [createContainer(resources, materials), [-2.45, 3.02, -1.05], 5.2],
    [createAiOrb(resources, materials), [3.35, 0.38, -1.35], 6.1],
  ];
  const mascots: FloatingMascot[] = [];

  definitions.slice(0, compact ? 6 : definitions.length).forEach(([visual, position, phase]) => {
    visual.position.set(...position);
    visual.scale.setScalar(compact ? 0.55 : 0.64);
    group.add(visual);
    mascots.push({ amplitude: 0.1 + (phase % 2) * 0.035, base: new Vector3(...position), phase, visual });
  });

  return {
    group,
    animate(time) {
      const seconds = time / 1000;
      mascots.forEach((mascot) => {
        mascot.visual.position.y = mascot.base.y + Math.sin(seconds * 1.05 + mascot.phase) * mascot.amplitude;
        mascot.visual.rotation.y = Math.sin(seconds * 0.7 + mascot.phase) * 0.28;
        mascot.visual.rotation.z = Math.cos(seconds * 0.62 + mascot.phase) * 0.07;
      });
    },
  };
}
