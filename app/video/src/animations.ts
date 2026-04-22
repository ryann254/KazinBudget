import { Easing, interpolate } from "remotion";

// "Crisp UI entrance" — fast, decelerating, no overshoot.
export const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);
// Balanced editorial ease-in-out for holds.
export const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);
// Playful overshoot for emphasis.
export const easeOvershoot = Easing.bezier(0.34, 1.56, 0.64, 1);

export function fadeInUp(frame: number, startFrame: number, durationFrames: number) {
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  return {
    opacity: progress,
    transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
  } satisfies React.CSSProperties;
}

export function typed(
  frame: number,
  startFrame: number,
  text: string,
  charFrames = 2,
): string {
  if (frame < startFrame) return "";
  const idx = Math.min(text.length, Math.floor((frame - startFrame) / charFrames));
  return text.slice(0, idx);
}

export function countUp(
  frame: number,
  startFrame: number,
  durationFrames: number,
  target: number,
): number {
  const value = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, target],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  return value;
}

export function pulse(frame: number, startFrame: number, durationFrames = 20): number {
  const half = durationFrames / 2;
  if (frame < startFrame) return 1;
  if (frame > startFrame + durationFrames) return 1;
  return interpolate(
    frame,
    [startFrame, startFrame + half, startFrame + durationFrames],
    [1, 1.06, 1],
    {
      easing: easeInOut,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
}
