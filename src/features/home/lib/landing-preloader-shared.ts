export const BRAND_TITLE = "Explore Malta Rentals";
export const INSTANT_CLIP_ID = "landing-preloader-instant-clip";
export const SVG_WIDTH = 760;
export const SVG_HEIGHT = 120;
export const TEXT_Y = 78;
export const MIN_DURATION_S = 3;
export const MAX_DURATION_S = 4.5;

export function buildWavePath(
  width: number,
  height: number,
  fillRatio: number,
  phase: number,
): string {
  const surfaceY = height * (1 - fillRatio);
  const amplitude = Math.min(10, height * 0.045);
  const steps = Math.max(12, Math.ceil(width / 24));

  let path = `M 0 ${height} L 0 ${surfaceY}`;

  for (let index = 0; index <= steps; index += 1) {
    const x = (index / steps) * width;
    const y =
      surfaceY + Math.sin((x / width) * Math.PI * 4 + phase) * amplitude;
    path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }

  path += ` L ${width} ${height} Z`;
  return path;
}

export const INITIAL_WAVE_PATH = buildWavePath(SVG_WIDTH, SVG_HEIGHT, 0, 0);
