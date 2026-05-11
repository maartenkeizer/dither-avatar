const GRID = 34;
const SIZE = 200;
const SCALE = 6;

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function hashMultiple(str: string, count: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(hashString(str + ":" + i));
  }
  return results;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

export function generateColors(seed: string): {
  fill: string;
  stroke: string;
} {
  const [hueHash] = hashMultiple(seed, 1);
  const hue = hueHash % 360;
  return {
    fill: hslToHex(hue, 85, 30),
    stroke: hslToHex(hue, 90, 65),
  };
}

function generateDensityGrid(seed: string): number[][] {
  const [angleHash, offsetHash] = hashMultiple(seed, 2);
  const angle = (angleHash % 360) * (Math.PI / 180);
  const offset = ((offsetHash % 100) / 100) * 0.4 - 0.2;

  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  const grid: number[][] = [];
  for (let y = 0; y < GRID; y++) {
    const row: number[] = [];
    for (let x = 0; x < GRID; x++) {
      const nx = (x / (GRID - 1)) * 2 - 1;
      const ny = (y / (GRID - 1)) * 2 - 1;
      const projected = nx * cosA + ny * sinA;
      const density = (projected + 1 + offset) / 2;
      row.push(Math.max(0, Math.min(1, density)));
    }
    grid.push(row);
  }
  return grid;
}

function dither(density: number[][]): number[][] {
  const result: number[][] = [];
  for (let y = 0; y < GRID; y++) {
    const row: number[] = [];
    for (let x = 0; x < GRID; x++) {
      const bayer = BAYER_4X4[y % 4][x % 4] / 16;
      row.push(density[y][x] >= bayer ? 1 : 0);
    }
    result.push(row);
  }
  return result;
}

function bitmapToPath(pixels: number[][]): string {
  const parts: string[] = [];
  for (let y = 0; y < GRID; y++) {
    const row = pixels[y];
    const segments: { start: number; len: number }[] = [];
    let x = 0;

    while (x < GRID) {
      if (row[x] === 1) {
        const start = x;
        while (x < GRID && row[x] === 1) x++;
        segments.push({ start, len: x - start });
      } else {
        x++;
      }
    }

    if (segments.length === 0) continue;

    let pathStr = `M${segments[0].start} ${y}`;
    let cursorX = segments[0].start;
    pathStr += `h${segments[0].len}`;
    cursorX += segments[0].len;

    for (let i = 1; i < segments.length; i++) {
      const gap = segments[i].start - cursorX;
      pathStr += `m${gap} 0h${segments[i].len}`;
      cursorX = segments[i].start + segments[i].len;
    }

    parts.push(pathStr);
  }
  return parts.join("");
}

export function generateDitherAvatar(seed: string): string {
  const { fill, stroke } = generateColors(seed);
  const density = generateDensityGrid(seed);
  const pixels = dither(density);
  const path = bitmapToPath(pixels);

  const autoScale = SIZE / GRID;
  const effectiveScale = autoScale * (SCALE / 6);
  const halfGrid = GRID / 2;
  const transform = `translate(${SIZE / 2},${SIZE / 2})scale(${effectiveScale})translate(-${halfGrid},-${halfGrid})`;

  return [
    `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">`,
    `<rect width="${SIZE}" height="${SIZE}" fill="${fill}"/>`,
    `<path fill="none" stroke="${stroke}" transform="${transform}" d="${path}"/>`,
    `</svg>`,
  ].join("");
}

export function ditherAvatarDataUri(seed: string): string {
  const svg = generateDitherAvatar(seed);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export { SIZE, GRID };
