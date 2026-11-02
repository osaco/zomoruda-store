import { describe, expect, it } from "vitest";
import { scaleImageDimensions } from "@/features/uploads/image-sizing";

describe("scaleImageDimensions", () => {
  it("scales landscape and portrait images without changing their aspect ratio", () => {
    expect(scaleImageDimensions(4000, 2000, 1600)).toEqual({ width: 1600, height: 800 });
    expect(scaleImageDimensions(1200, 2400, 1600)).toEqual({ width: 800, height: 1600 });
  });

  it("does not upscale images smaller than the requested maximum", () => {
    expect(scaleImageDimensions(600, 400, 1600)).toEqual({ width: 600, height: 400 });
  });

  it("rejects invalid dimensions", () => {
    expect(() => scaleImageDimensions(0, 10, 100)).toThrow(RangeError);
  });
});
