import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import type { DisposableResource } from "./three-resource-cleanup";

type FloatingIcon = {
  readonly base: Vector3;
  readonly bob: number;
  readonly phase: number;
  readonly spin: number;
  readonly visual: Group;
};

type StudioAssets = {
  readonly animate: (time: number) => void;
  readonly group: Group;
  readonly resources: DisposableResource[];
};

type Vector = readonly [number, number, number];

function addBox(
  parent: Group,
  resources: DisposableResource[],
  dimensions: Vector,
  position: Vector,
  color: number,
): Mesh {
  const geometry = new BoxGeometry(...dimensions);
  const material = new MeshStandardMaterial({ color, metalness: 0.08, roughness: 0.48 });
  const mesh = new Mesh(geometry, material);
  mesh.position.set(...position);
  parent.add(mesh);
  resources.push(geometry, material);
  return mesh;
}
function addSphere(
  parent: Group,
  resources: DisposableResource[],
  radius: number,
  position: Vector,
  color: number,
): void {
  const geometry = new SphereGeometry(radius, 14, 10);
  const material = new MeshStandardMaterial({ color, metalness: 0.05, roughness: 0.42 });
  const mesh = new Mesh(geometry, material);
  mesh.position.set(...position);
  parent.add(mesh);
  resources.push(geometry, material);
}

function createTerminal(resources: DisposableResource[]): Group {
  const icon = new Group();
  addBox(icon, resources, [1.05, 0.78, 0.22], [0, 0, 0], 0x273d7c);
  addBox(icon, resources, [0.83, 0.53, 0.04], [0, 0, 0.14], 0x10284a);
  const prompt = addBox(icon, resources, [0.11, 0.25, 0.05], [-0.23, 0.02, 0.17], 0x74d8c2);
  prompt.rotation.z = -0.7;
  addBox(icon, resources, [0.25, 0.06, 0.05], [0.12, -0.18, 0.17], 0xffb45d);
  return icon;
}

function createCodeBrackets(resources: DisposableResource[]): Group {
  const icon = new Group();
  const leftTop = addBox(icon, resources, [0.12, 0.43, 0.14], [-0.34, 0.2, 0], 0x3e62bd);
  leftTop.rotation.z = 0.55;
  const leftBottom = addBox(icon, resources, [0.12, 0.43, 0.14], [-0.34, -0.2, 0], 0x3e62bd);
  leftBottom.rotation.z = -0.55;
  const rightTop = addBox(icon, resources, [0.12, 0.43, 0.14], [0.34, 0.2, 0], 0x198c87);
  rightTop.rotation.z = -0.55;
  const rightBottom = addBox(icon, resources, [0.12, 0.43, 0.14], [0.34, -0.2, 0], 0x198c87);
  rightBottom.rotation.z = 0.55;
  const slash = addBox(icon, resources, [0.1, 0.74, 0.14], [0, 0, 0.04], 0xffb45d);
  slash.rotation.z = 0.42;
  return icon;
}

function createDatabase(resources: DisposableResource[]): Group {
  const icon = new Group();
  const geometry = new CylinderGeometry(0.4, 0.4, 0.64, 16);
  const material = new MeshStandardMaterial({ color: 0x198c87, metalness: 0.12, roughness: 0.4 });
  const body = new Mesh(geometry, material);
  icon.add(body);
  resources.push(geometry, material);
  [0.22, 0, -0.22].forEach((height, index) => {
    const ringGeometry = new TorusGeometry(0.4, 0.04, 8, 16);
    const ringMaterial = new MeshStandardMaterial({ color: index === 1 ? 0xffb45d : 0xe9f4ee, roughness: 0.35 });
    const ring = new Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = height;
    icon.add(ring);
    resources.push(ringGeometry, ringMaterial);
  });
  return icon;
}

function createCloudDeploy(resources: DisposableResource[]): Group {
  const icon = new Group();
  addSphere(icon, resources, 0.28, [-0.25, -0.05, 0], 0x74d8c2);
  addSphere(icon, resources, 0.37, [0, 0.1, 0.02], 0x74d8c2);
  addSphere(icon, resources, 0.24, [0.3, -0.05, 0], 0x74d8c2);
  addBox(icon, resources, [0.78, 0.22, 0.28], [0, -0.22, 0], 0x74d8c2);
  const arrow = addBox(icon, resources, [0.1, 0.48, 0.14], [0, 0.65, 0], 0xffb45d);
  arrow.rotation.z = 0.1;
  const coneGeometry = new ConeGeometry(0.2, 0.25, 4);
  const coneMaterial = new MeshStandardMaterial({ color: 0xffb45d, roughness: 0.42 });
  const cone = new Mesh(coneGeometry, coneMaterial);
  cone.position.y = 0.96;
  icon.add(cone);
  resources.push(coneGeometry, coneMaterial);
  return icon;
}

function addIcon(
  parent: Group,
  icons: FloatingIcon[],
  visual: Group,
  position: Vector,
  phase: number,
  scale: number,
): void {
  visual.position.set(...position);
  visual.scale.setScalar(scale);
  visual.rotation.set(0.22, -0.42, 0.08);
  parent.add(visual);
  icons.push({
    base: new Vector3(...position),
    bob: 0.08 + phase * 0.012,
    phase,
    spin: -0.42,
    visual,
  });
}

export function createStudioObjects(compact: boolean): StudioAssets {
  const resources: DisposableResource[] = [];
  const group = new Group();
  const icons: FloatingIcon[] = [];
  const scale = compact ? 0.62 : 0.78;

  addIcon(group, icons, createCloudDeploy(resources), [2.35, 1.78, 0.1], 0.2, scale);
  addIcon(group, icons, createTerminal(resources), [3.08, 0.38, 0.2], 1.4, scale);
  addIcon(group, icons, createCodeBrackets(resources), [2.42, -1.2, 0.12], 2.1, scale * 0.82);
  addIcon(group, icons, createDatabase(resources), [3.2, -2.05, 0.18], 3.2, scale * 0.7);

  return {
    group,
    resources,
    animate(time) {
      const seconds = time / 1000;
      icons.forEach((icon) => {
        icon.visual.position.y = icon.base.y + Math.sin(seconds * 0.78 + icon.phase) * icon.bob;
        icon.visual.rotation.y = icon.spin + Math.sin(seconds * 0.6 + icon.phase) * 0.2;
        icon.visual.rotation.z = 0.08 + Math.cos(seconds * 0.55 + icon.phase) * 0.07;
      });
    },
  };
}
