import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, fontFamily } from "../../theme";
import { BrandTitle } from "../../components/BrandTitle";
import { TOTAL_FRAMES } from "./timeline";

const EASE_OUT_EXPO = Easing.bezier(0.16, 1, 0.3, 1);

export const OutroPage: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    easing: EASE_OUT_EXPO,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [TOTAL_FRAMES - 18, TOTAL_FRAMES - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Subtle ambient backdrop: two brand-colored glow blobs drift in.
  const glowAmp = interpolate(frame, [0, 30, TOTAL_FRAMES - 20, TOTAL_FRAMES], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Footer CTA fades in after the logo settles.
  const footerReveal = interpolate(frame, [80, 105], [0, 1], {
    easing: EASE_OUT_EXPO,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const footerTY = interpolate(footerReveal, [0, 1], [12, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        fontFamily,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      {/* Ambient glows */}
      <div
        style={{
          position: "absolute",
          top: -220,
          left: -220,
          width: 720,
          height: 720,
          borderRadius: 360,
          background: COLORS.red,
          opacity: 0.14 * glowAmp,
          filter: "blur(120px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -220,
          right: -220,
          width: 760,
          height: 760,
          borderRadius: 380,
          background: COLORS.yellow,
          opacity: 0.12 * glowAmp,
          filter: "blur(140px)",
        }}
      />

      {/* Centered brand animation */}
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <BrandTitle frame={frame} tagline="Ready to make the move?" />
      </AbsoluteFill>

      {/* Footer CTA */}
      <div
        style={{
          position: "absolute",
          bottom: 72,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: footerReveal,
          transform: `translateY(${footerTY.toFixed(1)}px)`,
          fontSize: 16,
          letterSpacing: "0.35em",
          fontWeight: 800,
          color: COLORS.white,
          textTransform: "uppercase",
        }}
      >
        <span style={{ color: COLORS.yellow }}>— </span>
        Know your numbers. Start your journey.
        <span style={{ color: COLORS.yellow }}> —</span>
      </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
