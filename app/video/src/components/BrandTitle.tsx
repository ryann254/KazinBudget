import React from "react";
import { Easing, interpolate } from "remotion";
import { COLORS, fontFamily } from "../theme";

const WORDMARK = "KAZI&BUDGET";
const PER_CHAR_DELAY = 3;
const DROP_DURATION = 22;
const AMP_PULSE_WINDOW = 18;
const UNDERLINE_START = 30;
const UNDERLINE_END = 65;
const TAGLINE_START = 35;
const TAGLINE_END = 65;

const OVERSHOOT = Easing.bezier(0.34, 1.56, 0.64, 1);
const EASE_OUT_EXPO = Easing.bezier(0.16, 1, 0.3, 1);

type BrandTitleProps = {
  frame: number;
  tagline: string;
  logoFontSize?: number;
  taglineFontSize?: number;
  underlineMaxWidth?: number;
};

export const BrandTitle: React.FC<BrandTitleProps> = ({
  frame,
  tagline,
  logoFontSize = 96,
  taglineFontSize = 24,
  underlineMaxWidth = 520,
}) => {
  const letters = WORDMARK.split("");
  const ampIdx = letters.indexOf("&");
  const ampStart = ampIdx * PER_CHAR_DELAY + DROP_DURATION;
  const ampT = Math.max(0, Math.min(1, (frame - ampStart) / AMP_PULSE_WINDOW));
  const ampScale = 1 + 0.28 * Math.sin(ampT * Math.PI);

  const underlineT = interpolate(
    frame,
    [UNDERLINE_START, UNDERLINE_END],
    [0, 1],
    {
      easing: EASE_OUT_EXPO,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const taglineReveal = interpolate(
    frame,
    [TAGLINE_START, TAGLINE_END],
    [0, 1],
    {
      easing: EASE_OUT_EXPO,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const taglineTY = interpolate(taglineReveal, [0, 1], [16, 0]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: logoFontSize,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        {letters.map((ch, i) => {
          const start = i * PER_CHAR_DELAY;
          const t = interpolate(
            frame,
            [start, start + DROP_DURATION],
            [0, 1],
            {
              easing: OVERSHOOT,
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );
          const y = (1 - t) * -60;
          const op = Math.max(0, Math.min(1, t * 1.5));
          const color = i < ampIdx ? COLORS.white : COLORS.red;
          const scale = ch === "&" ? ampScale : 1;
          return (
            <span
              key={`${ch}-${i}`}
              style={{
                display: "inline-block",
                transform: `translateY(${y.toFixed(1)}px) scale(${scale.toFixed(3)})`,
                opacity: op,
                color,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 14,
          height: 5,
          width: Math.round(underlineT * underlineMaxWidth),
          backgroundColor: COLORS.yellow,
        }}
      />
      <div
        style={{
          marginTop: 22,
          fontSize: taglineFontSize,
          fontWeight: 700,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: COLORS.yellow,
          textAlign: "center",
          maxWidth: 1400,
          opacity: taglineReveal,
          transform: `translateY(${taglineTY.toFixed(1)}px)`,
        }}
      >
        {tagline}
      </div>
    </div>
  );
};
