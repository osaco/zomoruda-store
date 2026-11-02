export function scaleImageDimensions(width: number, height: number, maxDimension: number) {
  if (![width, height, maxDimension].every((value) => Number.isFinite(value) && value > 0)) {
    throw new RangeError("Image dimensions and maximum must be positive finite numbers");
  }
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
