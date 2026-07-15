import {
  CapsuleGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { DisposableResource } from "./three-resource-cleanup";

export type Vector = readonly [number, number, number];

export type StudioMaterials = Readonly<{
  amber: MeshStandardMaterial;
  cobalt: MeshStandardMaterial;
  coral: MeshStandardMaterial;
  cream: MeshStandardMaterial;
  hair: MeshStandardMaterial;
  indigo: MeshStandardMaterial;
  ink: MeshStandardMaterial;
  leaf: MeshStandardMaterial;
  mint: MeshStandardMaterial;
  navy: MeshStandardMaterial;
  paper: MeshStandardMaterial;
  screen: MeshStandardMaterial;
  skin: MeshStandardMaterial;
  steel: MeshStandardMaterial;
  teal: MeshStandardMaterial;
}>

function material(color: number, metalness = 0.03, roughness = 0.58): MeshStandardMaterial {
  return new MeshStandardMaterial({ color, metalness, roughness });
}

export function createStudioMaterials(resources: DisposableResource[]): StudioMaterials {
  const materials = {
    amber: material(0xed9a45, 0.08, 0.42),
    cobalt: material(0x3e62bd, 0.08, 0.48),
    coral: material(0xe98668, 0.02, 0.62),
    cream: material(0xead8c1, 0.02, 0.68),
    hair: material(0x251f27, 0.02, 0.7),
    indigo: material(0x273d7c, 0.12, 0.42),
    ink: material(0x15213e, 0.14, 0.38),
    leaf: material(0x5e8f68, 0.01, 0.72),
    mint: material(0x74d8c2, 0.04, 0.5),
    navy: material(0x18305c, 0.06, 0.56),
    paper: material(0xfffaf2, 0.01, 0.75),
    screen: material(0x0b2338, 0.18, 0.3),
    skin: material(0xd79a73, 0.01, 0.76),
    steel: material(0x8b97aa, 0.32, 0.34),
    teal: material(0x198c87, 0.08, 0.48),
  } satisfies Record<string, MeshStandardMaterial>;
  resources.push(...Object.values(materials));
  return materials;
}

function place(mesh: Mesh, position: Vector, rotation?: Vector): Mesh {
  mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  return mesh;
}

export function addRoundedBox(
  parent: Group,
  resources: DisposableResource[],
  dimensions: Vector,
  position: Vector,
  materialValue: MeshStandardMaterial,
  radius = 0.1,
  rotation?: Vector,
): Mesh {
  const geometry = new RoundedBoxGeometry(dimensions[0], dimensions[1], dimensions[2], 3, radius);
  const mesh = place(new Mesh(geometry, materialValue), position, rotation);
  parent.add(mesh);
  resources.push(geometry);
  return mesh;
}

export function addSphere(
  parent: Group,
  resources: DisposableResource[],
  radius: number,
  position: Vector,
  materialValue: MeshStandardMaterial,
  scale?: Vector,
): Mesh {
  const geometry = new SphereGeometry(radius, 18, 12);
  const mesh = place(new Mesh(geometry, materialValue), position);
  if (scale) mesh.scale.set(...scale);
  parent.add(mesh);
  resources.push(geometry);
  return mesh;
}

export function addCylinder(
  parent: Group,
  resources: DisposableResource[],
  radius: number,
  height: number,
  position: Vector,
  materialValue: MeshStandardMaterial,
  rotation?: Vector,
): Mesh {
  const geometry = new CylinderGeometry(radius, radius, height, 18);
  const mesh = place(new Mesh(geometry, materialValue), position, rotation);
  parent.add(mesh);
  resources.push(geometry);
  return mesh;
}

export function addCapsule(
  parent: Group,
  resources: DisposableResource[],
  radius: number,
  length: number,
  position: Vector,
  materialValue: MeshStandardMaterial,
  rotation?: Vector,
): Mesh {
  const geometry = new CapsuleGeometry(radius, length, 6, 12);
  const mesh = place(new Mesh(geometry, materialValue), position, rotation);
  parent.add(mesh);
  resources.push(geometry);
  return mesh;
}

export function addTorus(
  parent: Group,
  resources: DisposableResource[],
  radius: number,
  tube: number,
  position: Vector,
  materialValue: MeshStandardMaterial,
  rotation?: Vector,
  arc = Math.PI * 2,
): Mesh {
  const geometry = new TorusGeometry(radius, tube, 8, 24, arc);
  const mesh = place(new Mesh(geometry, materialValue), position, rotation);
  parent.add(mesh);
  resources.push(geometry);
  return mesh;
}

export function addRodBetween(
  parent: Group,
  resources: DisposableResource[],
  start: Vector,
  end: Vector,
  radius: number,
  materialValue: MeshStandardMaterial,
): Mesh {
  const startVector = new Vector3(...start);
  const endVector = new Vector3(...end);
  const direction = endVector.clone().sub(startVector);
  const geometry = new CylinderGeometry(radius, radius, direction.length(), 12);
  const mesh = new Mesh(geometry, materialValue);
  mesh.position.copy(startVector.add(endVector).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize());
  parent.add(mesh);
  resources.push(geometry);
  return mesh;
}

export function enableStudioShadows(root: Group): void {
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
  });
}
