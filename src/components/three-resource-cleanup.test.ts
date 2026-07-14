import { describe, expect, it, vi } from "vitest";
import { disposeResources } from "./three-resource-cleanup";

describe("disposeResources", () => {
  it("disposes every resource that completed initialization", () => {
    const firstDispose = vi.fn();
    const secondDispose = vi.fn();

    disposeResources([{ dispose: firstDispose }, { dispose: secondDispose }]);

    expect(firstDispose).toHaveBeenCalledOnce();
    expect(secondDispose).toHaveBeenCalledOnce();
  });
});
