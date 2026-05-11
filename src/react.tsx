import type { CSSProperties } from "react";
import {
  ditherAvatarDataUri,
  generateDitherAvatar,
  SIZE,
} from "./index";

export type DitherAvatarProps = {
  seed: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

export function DitherAvatar({
  seed,
  size = 40,
  className,
  style,
}: DitherAvatarProps) {
  const uri = ditherAvatarDataUri(seed);
  return (
    <img
      src={uri}
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: "50%", ...style }}
    />
  );
}

export function DitherAvatarSVG({
  seed,
  size = 40,
  className,
  style,
}: DitherAvatarProps) {
  const svg = generateDitherAvatar(seed);
  const inner = svg
    .replace(/<svg[^>]*>/, "")
    .replace(/<\/svg>/, "")
    .trim();

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      style={{ borderRadius: "50%", ...style }}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
