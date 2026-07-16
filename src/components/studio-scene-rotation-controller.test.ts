import { Group } from "three";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createStudioRotationController } from "./studio-scene-rotation-controller";

afterEach(() => {
  document.body.replaceChildren();
});

describe("createStudioRotationController", () => {
  it("renders direct controls even when the animation loop is paused", () => {
    const scene = document.createElement("div");
    const host = document.createElement("div");
    const group = new Group();
    const renderCurrentFrame = vi.fn();
    scene.className = "studio-scene";
    scene.append(host);
    document.body.append(scene);

    const controller = createStudioRotationController(host, group, renderCurrentFrame);
    host.dispatchEvent(new CustomEvent("studiorotate", { detail: { delta: 10 } }));

    expect(group.rotation.y).toBeCloseTo(-0.2, 3);
    expect(Number.parseFloat(scene.style.getPropertyValue("--studio-rotation-y"))).toBeCloseTo(-11.46, 1);
    expect(renderCurrentFrame).toHaveBeenCalledOnce();

    host.dispatchEvent(new Event("studioreset"));

    expect(group.rotation.y).toBeCloseTo(-0.36, 3);
    expect(Number.parseFloat(scene.style.getPropertyValue("--studio-rotation-y"))).toBeCloseTo(-20.63, 1);
    expect(renderCurrentFrame).toHaveBeenCalledTimes(2);
    controller.dispose();
  });

  it("clamps the actual Three.js group to the curated isometric arc", () => {
    const scene = document.createElement("div");
    const host = document.createElement("div");
    const group = new Group();
    scene.className = "studio-scene";
    scene.append(host);
    document.body.append(scene);

    const controller = createStudioRotationController(host, group);
    host.dispatchEvent(new CustomEvent("studiorotate", { detail: { delta: 10 } }));
    for (let frame = 0; frame < 120; frame += 1) controller.update();

    expect(group.rotation.y).toBeCloseTo(-0.2, 3);
    expect(Number.parseFloat(scene.style.getPropertyValue("--studio-rotation-y"))).toBeCloseTo(-11.46, 1);

    host.dispatchEvent(new CustomEvent("studiorotate", { detail: { delta: -10 } }));
    for (let frame = 0; frame < 120; frame += 1) controller.update();

    expect(group.rotation.y).toBeCloseTo(-0.58, 3);
    expect(Number.parseFloat(scene.style.getPropertyValue("--studio-rotation-y"))).toBeCloseTo(-33.23, 1);

    controller.dispose();
    expect(scene.style.getPropertyValue("--studio-rotation-y")).toBe("");
  });
});
