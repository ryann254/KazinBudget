import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { brutalistCard, COLORS, fontFamily, formatKES } from "../../theme";
import { easeOutExpo, fadeInUp, typed } from "../../animations";
import {
  CAMERA_Y,
  DIST_CROSSFADE_FRAMES,
  DIST_HOVER_COUNT,
  DIST_SCENARIO_SLOTS,
  FILTER_CHIPS,
  FILTER_CYCLE_COUNT,
  FILTER_CYCLE_PER_ITEM,
  GAP_CARDS,
  GAPS_CYCLE_COUNT,
  GAPS_CYCLE_PER_ITEM,
  LAYOUT,
  PAGE_HEIGHT,
  PERCENTILE_DRAW_FRAMES,
  SCENARIOS,
  SCENES,
  SECTION_Y,
  type Scenario,
  hoverIndicesForScenario,
} from "./timeline";

type Section = "filters" | "distribution" | "percentile" | "gaps";

const STAMP_STYLE: React.CSSProperties = {
  position: "absolute",
  top: -16,
  padding: "6px 14px",
  fontWeight: 800,
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  border: `2px solid ${COLORS.black}`,
  fontFamily,
  zIndex: 2,
};

// ── Section focus / camera ────────────────────────────────
function sectionFocus(frame: number): Record<Section, number> {
  const focusAt = (start: number, duration: number) => {
    const rampIn = 15;
    const rampOut = 15;
    if (frame < start) return 0;
    if (frame < start + rampIn) {
      return interpolate(frame, [start, start + rampIn], [0, 1], {
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    }
    if (frame < start + duration - rampOut) return 1;
    if (frame < start + duration) {
      return interpolate(
        frame,
        [start + duration - rampOut, start + duration],
        [1, 0],
        {
          easing: Easing.bezier(0.45, 0, 0.55, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      );
    }
    return 0;
  };
  return {
    filters: focusAt(SCENES.filters.start, SCENES.filters.duration),
    distribution: focusAt(
      SCENES.distribution.start,
      SCENES.distribution.duration,
    ),
    percentile: focusAt(SCENES.percentile.start, SCENES.percentile.duration),
    gaps: focusAt(SCENES.gaps.start, SCENES.gaps.duration),
  };
}

function cameraScrollY(frame: number): number {
  const waypoints = [
    { f: 0, y: CAMERA_Y.filters },
    { f: SCENES.filters.start + 15, y: CAMERA_Y.filters },
    {
      f: SCENES.filters.start + SCENES.filters.duration - 20,
      y: CAMERA_Y.filters,
    },
    { f: SCENES.distribution.start + 20, y: CAMERA_Y.distribution },
    {
      f: SCENES.distribution.start + SCENES.distribution.duration - 20,
      y: CAMERA_Y.distribution,
    },
    { f: SCENES.percentile.start + 20, y: CAMERA_Y.percentile },
    {
      f: SCENES.percentile.start + SCENES.percentile.duration - 20,
      y: CAMERA_Y.percentile,
    },
    { f: SCENES.gaps.start + 20, y: CAMERA_Y.gaps },
    { f: SCENES.gaps.start + SCENES.gaps.duration, y: CAMERA_Y.gaps },
  ];
  return interpolate(
    frame,
    waypoints.map((w) => w.f),
    waypoints.map((w) => w.y),
    {
      easing: Easing.bezier(0.45, 0, 0.55, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
}

// ── Section shell ─────────────────────────────────────────
type SectionShellProps = {
  children: React.ReactNode;
  stamp: string;
  stampBg: string;
  stampColor?: string;
  stampRotate?: number;
  stampSide?: "left" | "right";
  accentColor: string;
  height: number;
  focusStrength: number;
};

const SectionShell: React.FC<SectionShellProps> = ({
  children,
  stamp,
  stampBg,
  stampColor = COLORS.black,
  stampRotate = -2,
  stampSide = "left",
  accentColor,
  height,
  focusStrength,
}) => {
  const shadowDepth = interpolate(focusStrength, [0, 1], [2, 4]);
  const dim = interpolate(focusStrength, [0, 1], [0.3, 1]);
  const blur = interpolate(focusStrength, [0, 1], [1.6, 0]);
  const scale = interpolate(focusStrength, [0, 1], [1, 1.02]);
  return (
    <div
      style={{
        position: "relative",
        height,
        width: LAYOUT.CONTENT_WIDTH,
        margin: "0 auto",
        opacity: dim,
        filter: `blur(${blur}px)`,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          ...STAMP_STYLE,
          [stampSide]: -12,
          backgroundColor: stampBg,
          color: stampColor,
          transform: `rotate(${stampRotate}deg)`,
        }}
      >
        {stamp}
      </div>
      <div
        style={{
          ...brutalistCard,
          borderLeft: `8px solid ${accentColor}`,
          padding: 32,
          paddingTop: 44,
          boxShadow: `${shadowDepth}px ${shadowDepth}px 0 ${COLORS.black}`,
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const SectionHeading: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      fontSize: 18,
      fontWeight: 900,
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      color: COLORS.black,
      marginBottom: 18,
    }}
  >
    <span style={{ color: COLORS.muted, fontWeight: 700 }}>— </span>
    {text}
  </div>
);

// ── Filters chip ──────────────────────────────────────────
type FilterChipProps = {
  label: string;
  value: string;
  color: string;
  highlight: number; // 0..1
  reveal: number; // 0..1
  rotate: number;
};

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  value,
  color,
  highlight,
  reveal,
  rotate,
}) => {
  const shadow = interpolate(highlight, [0, 1], [4, 8]);
  const scale = interpolate(highlight, [0, 1], [1, 1.08]);
  const lift = interpolate(highlight, [0, 1], [0, -2]);
  const textColor = color === "#F4D35E" ? COLORS.black : COLORS.white;
  return (
    <div
      style={{
        position: "relative",
        padding: "14px 22px",
        backgroundColor: color,
        border: `3px solid ${COLORS.black}`,
        boxShadow: `${shadow}px ${shadow}px 0 ${COLORS.black}`,
        transform: `translateY(${interpolate(reveal, [0, 1], [18, 0]) + lift}px) scale(${scale}) rotate(${rotate}deg)`,
        opacity:
          interpolate(reveal, [0, 1], [0, 1]) *
          interpolate(highlight, [0, 1], [0.45, 1]),
        outline: highlight > 0.4 ? `3px solid ${COLORS.yellow}` : "none",
        outlineOffset: 4,
        fontFamily,
        minWidth: 220,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.2em",
          color: textColor,
          opacity: 0.85,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: textColor,
          letterSpacing: "0.05em",
          marginTop: 4,
          textTransform: "uppercase",
        }}
      >
        {value}
      </div>
    </div>
  );
};

// ── Animated distribution chip (typewriter + change-highlight) ──
type AnimatedDistChipProps = {
  bgColor: string;
  textColor: string;
  value: string;
  frame: number;
  changeStart: number;
};

const AnimatedDistChip: React.FC<AnimatedDistChipProps> = ({
  bgColor,
  textColor,
  value,
  frame,
  changeStart,
}) => {
  const upper = value.toUpperCase();
  const typedText = typed(frame, changeStart, upper, 2);
  const showCursor = frame >= changeStart && typedText.length < upper.length;
  const elapsed = frame - changeStart;
  const highlight = interpolate(elapsed, [0, 8, 30, 48], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = 1 + 0.1 * highlight;
  const shadow = 2 + 3 * highlight;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 12px",
        backgroundColor: bgColor,
        color: textColor,
        border: `2px solid ${COLORS.black}`,
        boxShadow: `${shadow.toFixed(1)}px ${shadow.toFixed(1)}px 0 ${COLORS.black}`,
        outline: highlight > 0.3 ? `3px solid ${COLORS.yellow}` : "none",
        outlineOffset: 3,
        transform: `scale(${scale.toFixed(3)})`,
        transformOrigin: "center center",
        minWidth: 110,
        textAlign: "center",
        fontVariant: "tabular-nums",
        fontWeight: 800,
      }}
    >
      {typedText}
      {showCursor ? (
        <span
          style={{
            opacity:
              0.35 + 0.45 * (Math.sin((frame - changeStart) * 0.6) * 0.5 + 0.5),
            marginLeft: 1,
          }}
        >
          |
        </span>
      ) : null}
    </span>
  );
};

// ── Distribution chart ────────────────────────────────────
type DistributionChartProps = {
  scenario: Scenario;
  hoverIndex: number | null;
  hoverPopIn: number;
  width: number;
  height: number;
  revealProgress: number; // 0..1 for morph
};

const DistributionChart: React.FC<DistributionChartProps> = ({
  scenario,
  hoverIndex,
  hoverPopIn,
  width,
  height,
  revealProgress,
}) => {
  const padX = 60;
  const padY = 60;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const bins = scenario.distribution;
  const n = bins.length;
  const maxFreq = Math.max(...bins.map((b) => b.frequency), 1);

  const xRange = scenario.maxX - scenario.minX;
  const xFor = (salary: number) =>
    padX + ((salary - scenario.minX) / xRange) * innerW;
  const yFor = (freq: number) => padY + innerH - (freq / maxFreq) * innerH;

  // Build area path.
  let areaD = `M ${xFor(bins[0].salary).toFixed(2)},${(padY + innerH).toFixed(2)}`;
  bins.forEach((b) => {
    const x = xFor(b.salary);
    const y = yFor(b.frequency);
    areaD += ` L ${x.toFixed(2)},${y.toFixed(2)}`;
  });
  areaD += ` L ${xFor(bins[n - 1].salary).toFixed(2)},${(padY + innerH).toFixed(2)} Z`;

  // Line path (top stroke).
  let lineD = "";
  bins.forEach((b, i) => {
    const x = xFor(b.salary);
    const y = yFor(b.frequency);
    lineD += i === 0 ? `M ${x.toFixed(2)},${y.toFixed(2)}` : ` L ${x.toFixed(2)},${y.toFixed(2)}`;
  });

  // X-axis ticks: 5 evenly spaced salary labels.
  const tickCount = 5;
  const xTicks = Array.from({ length: tickCount }, (_, i) => {
    const salary = scenario.minX + (i / (tickCount - 1)) * xRange;
    return { salary, x: xFor(salary) };
  });

  // Y-axis gridlines (5 horizontal).
  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const yLabels = gridLines.map((frac) => {
    const v = maxFreq * (1 - frac);
    return { y: padY + frac * innerH, label: `${Math.round(v)}%` };
  });

  const cursorInfo = (() => {
    if (hoverIndex === null) return null;
    const b = bins[hoverIndex];
    return {
      row: b,
      cx: xFor(b.salary),
      cy: yFor(b.frequency),
    };
  })();

  // Vertical "YOU" marker at userSalary.
  const youX = xFor(scenario.userSalary);
  // Dashed red median line.
  const medianX = xFor(scenario.median);

  const formatKShort = (v: number) =>
    `${Math.round(v / 1000)}k`;

  // Path length for stroke animation.
  const LEN = 4000;
  const dashOffset = interpolate(revealProgress, [0, 1], [LEN, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
    >
      {/* Gridlines */}
      {yLabels.map((g) => (
        <line
          key={`g-${g.label}`}
          x1={padX}
          x2={width - padX}
          y1={g.y}
          y2={g.y}
          stroke={COLORS.black}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.12}
        />
      ))}
      {/* Y-axis labels */}
      {yLabels.map((g) => (
        <text
          key={`yl-${g.label}`}
          x={padX - 10}
          y={g.y + 4}
          textAnchor="end"
          fontSize={12}
          fontWeight={800}
          fill={COLORS.muted}
          style={{ fontFamily }}
        >
          {g.label}
        </text>
      ))}
      {/* X-axis labels */}
      {xTicks.map((t) => (
        <text
          key={`xt-${t.salary}`}
          x={t.x}
          y={height - padY + 22}
          textAnchor="middle"
          fontSize={12}
          fontWeight={800}
          fill={COLORS.muted}
          style={{ fontFamily }}
        >
          {formatKShort(t.salary)}
        </text>
      ))}
      {/* Axis lines */}
      <line
        x1={padX}
        x2={width - padX}
        y1={height - padY}
        y2={height - padY}
        stroke={COLORS.black}
        strokeWidth={2}
      />
      <line
        x1={padX}
        x2={padX}
        y1={padY}
        y2={height - padY}
        stroke={COLORS.black}
        strokeWidth={2}
      />
      {/* Area fill */}
      <path
        d={areaD}
        fill={COLORS.muted}
        opacity={0.35 * revealProgress}
      />
      {/* Line stroke */}
      <path
        d={lineD}
        fill="none"
        stroke={COLORS.muted}
        strokeWidth={4}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={LEN}
        strokeDashoffset={dashOffset}
      />

      {/* Median dashed red line */}
      <g opacity={revealProgress}>
        <line
          x1={medianX}
          x2={medianX}
          y1={padY}
          y2={height - padY}
          stroke={COLORS.red}
          strokeWidth={3}
          strokeDasharray="8 6"
        />
        <rect
          x={medianX - 36}
          y={padY - 30}
          width={72}
          height={22}
          fill={COLORS.red}
          stroke={COLORS.black}
          strokeWidth={2}
        />
        <text
          x={medianX}
          y={padY - 14}
          textAnchor="middle"
          fontSize={12}
          fontWeight={900}
          fill={COLORS.white}
          style={{ fontFamily }}
          letterSpacing={1.5}
        >
          MEDIAN
        </text>
      </g>

      {/* YOU marker */}
      <g opacity={revealProgress}>
        <line
          x1={youX}
          x2={youX}
          y1={padY}
          y2={height - padY}
          stroke={COLORS.black}
          strokeWidth={3}
        />
        <rect
          x={youX - 28}
          y={height - padY - 2}
          width={56}
          height={26}
          fill={COLORS.yellow}
          stroke={COLORS.black}
          strokeWidth={3}
        />
        <text
          x={youX}
          y={height - padY + 17}
          textAnchor="middle"
          fontSize={13}
          fontWeight={900}
          fill={COLORS.black}
          style={{ fontFamily }}
          letterSpacing={1.5}
        >
          YOU
        </text>
      </g>

      {/* Hover cursor */}
      {cursorInfo ? (
        <g opacity={hoverPopIn}>
          <line
            x1={cursorInfo.cx}
            x2={cursorInfo.cx}
            y1={padY}
            y2={height - padY}
            stroke={COLORS.black}
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.35}
          />
          <circle
            cx={cursorInfo.cx}
            cy={cursorInfo.cy}
            r={10 * interpolate(hoverPopIn, [0, 1], [0.4, 1])}
            fill={COLORS.muted}
            stroke={COLORS.black}
            strokeWidth={3}
          />
        </g>
      ) : null}

      {/* Enlarged tooltip (w=320) */}
      {cursorInfo ? (
        (() => {
          const tooltipW = 320;
          const headingH = 48;
          const rowH = 36;
          const lines = [
            {
              label: "PEOPLE",
              value: `${cursorInfo.row.frequency}%`,
              color: COLORS.muted,
            },
          ];
          const tooltipH = headingH + lines.length * rowH + 10;
          const gapAbove = 40;
          let tx = cursorInfo.cx - tooltipW / 2;
          if (cursorInfo.cx >= width - padX - 80) tx = cursorInfo.cx - tooltipW + 18;
          if (cursorInfo.cx <= padX + 80) tx = cursorInfo.cx - 18;
          tx = Math.max(padX, Math.min(width - padX - tooltipW, tx));
          const ty = Math.max(padY - 2, cursorInfo.cy - gapAbove - tooltipH);
          return (
            <g opacity={hoverPopIn}>
              <rect
                x={tx + 6}
                y={ty + 6}
                width={tooltipW}
                height={tooltipH}
                fill={COLORS.black}
              />
              <rect
                x={tx}
                y={ty}
                width={tooltipW}
                height={tooltipH}
                fill={COLORS.white}
                stroke={COLORS.black}
                strokeWidth={4}
              />
              <text
                x={tx + 20}
                y={ty + 34}
                fontSize={22}
                fontWeight={900}
                letterSpacing={2}
                fill={COLORS.black}
                style={{ fontFamily }}
              >
                SALARY: {formatKES(cursorInfo.row.salary)}
              </text>
              <line
                x1={tx + 20}
                x2={tx + tooltipW - 20}
                y1={ty + headingH - 4}
                y2={ty + headingH - 4}
                stroke={COLORS.black}
                strokeWidth={2}
                opacity={0.25}
              />
              {lines.map((ln, i) => (
                <g key={`tt-${ln.label}`}>
                  <rect
                    x={tx + 20}
                    y={ty + headingH + i * rowH + 6}
                    width={18}
                    height={18}
                    fill={ln.color}
                    stroke={COLORS.black}
                    strokeWidth={2}
                  />
                  <text
                    x={tx + 46}
                    y={ty + headingH + i * rowH + 21}
                    fontSize={19}
                    fontWeight={900}
                    letterSpacing={1}
                    fill={ln.color}
                    stroke={COLORS.black}
                    strokeWidth={0.4}
                    style={{ fontFamily }}
                  >
                    {ln.label}: {ln.value}
                  </text>
                </g>
              ))}
            </g>
          );
        })()
      ) : null}
    </svg>
  );
};

// ── Percentile bar ────────────────────────────────────────
const PercentileBar: React.FC<{
  percentile: number;
  verdict: string;
  p25: number;
  median: number;
  p75: number;
  progress: number; // 0..1
  revealStamp: number; // 0..1
}> = ({ percentile, verdict, p25, median, p75, progress, revealStamp }) => {
  const barHeight = 48;
  const barWidth = LAYOUT.CONTENT_WIDTH - 200;
  const filled = (percentile / 100) * barWidth * progress;

  const ticks = [
    { pct: 25, label: "P25" },
    { pct: 50, label: "MEDIAN" },
    { pct: 75, label: "P75" },
  ];

  const verdictColor =
    verdict === "BELOW"
      ? COLORS.red
      : verdict === "AT_MARKET"
        ? COLORS.teal
        : COLORS.blue;
  const verdictText =
    verdict === "AT_MARKET" ? "AT MARKET" : verdict;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
      <div style={{ flex: 1 }}>
        {/* Bar */}
        <div
          style={{
            position: "relative",
            height: barHeight,
            width: barWidth,
            border: `3px solid ${COLORS.black}`,
            backgroundColor: COLORS.white,
            boxShadow: `4px 4px 0 ${COLORS.black}`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: filled,
              backgroundColor: COLORS.yellow,
              borderRight: `3px solid ${COLORS.black}`,
            }}
          />
          {/* dashed ticks */}
          {ticks.map((t) => {
            const x = (t.pct / 100) * barWidth;
            return (
              <div
                key={t.label}
                style={{
                  position: "absolute",
                  top: 0,
                  left: x,
                  height: "100%",
                  borderLeft: `2px dashed ${COLORS.black}`,
                  opacity: 0.5,
                }}
              />
            );
          })}
          {/* Percentile label */}
          <div
            style={{
              position: "absolute",
              top: -28,
              left: Math.min(
                barWidth - 80,
                Math.max(0, (percentile / 100) * barWidth - 40),
              ),
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: "0.15em",
              color: COLORS.black,
              opacity: progress,
            }}
          >
            P{percentile}
          </div>
        </div>
        {/* Labels under bar */}
        <div
          style={{
            position: "relative",
            width: barWidth,
            height: 60,
            marginTop: 10,
          }}
        >
          {[
            { pct: 25, label: "P25", value: p25 },
            { pct: 50, label: "MEDIAN", value: median },
            { pct: 75, label: "P75", value: p75 },
          ].map((t) => (
            <div
              key={t.label}
              style={{
                position: "absolute",
                left: (t.pct / 100) * barWidth,
                transform: "translateX(-50%)",
                textAlign: "center",
                fontFamily,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  color: COLORS.muted,
                }}
              >
                {t.label}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: COLORS.black,
                }}
              >
                {formatKES(t.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Verdict stamp */}
      <div
        style={{
          transform: `rotate(-2deg) scale(${interpolate(revealStamp, [0, 1], [0.7, 1])})`,
          opacity: revealStamp,
          border: `4px solid ${verdictColor}`,
          padding: "18px 26px",
          fontFamily,
          textAlign: "center",
          backgroundColor: COLORS.white,
          boxShadow: `6px 6px 0 ${COLORS.black}`,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.2em",
            color: COLORS.muted,
            marginBottom: 4,
          }}
        >
          VERDICT
        </div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 900,
            letterSpacing: "0.1em",
            color: verdictColor,
          }}
        >
          {verdictText}
        </div>
      </div>
    </div>
  );
};

// ── Gap card ──────────────────────────────────────────────
type GapCardProps = {
  label: string;
  value: number;
  accent: string;
  highlight: number;
  reveal: number;
  tooltipText: string;
};

const GapCard: React.FC<GapCardProps> = ({
  label,
  value,
  accent,
  highlight,
  reveal,
  tooltipText,
}) => {
  const shadow = interpolate(highlight, [0, 1], [4, 8]);
  const lift = interpolate(highlight, [0, 1], [0, -2]);
  const scale = interpolate(highlight, [0, 1], [1, 1.08]);

  // Tooltip animation: opacity + translateY
  const tooltipOpacity = interpolate(highlight, [0.1, 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tooltipTY = interpolate(highlight, [0.1, 0.5], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // All tooltips position ABOVE the card, centered, for visibility.
  const tooltipPosition: React.CSSProperties = {
    bottom: "calc(100% + 20px)",
    left: "50%",
  };

  return (
    <div
      style={{
        position: "relative",
        border: `3px solid ${COLORS.black}`,
        borderLeft: `6px solid ${accent}`,
        backgroundColor: COLORS.white,
        padding: 24,
        textAlign: "center",
        boxShadow: `${shadow}px ${shadow}px 0 ${COLORS.black}`,
        transform: `translateY(${interpolate(reveal, [0, 1], [24, 0]) + lift}px) scale(${scale})`,
        opacity:
          interpolate(reveal, [0, 1], [0, 1]) *
          interpolate(highlight, [0, 1], [0.35, 1]),
        outline: highlight > 0.4 ? `3px solid ${COLORS.yellow}` : "none",
        outlineOffset: 4,
        fontFamily,
        filter: highlight < 0.3 && reveal > 0.9 ? "blur(0.6px)" : "none",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.15em",
          color: COLORS.muted,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 34,
          fontWeight: 900,
          color: accent,
        }}
      >
        {formatKES(value)}
      </div>

      {/* Explainer tooltip, anchored next to or above the card */}
      {tooltipOpacity > 0 ? (
        <div
          style={{
            position: "absolute",
            ...tooltipPosition,
            width: 280,
            padding: "14px 16px",
            backgroundColor: COLORS.white,
            border: `3px solid ${COLORS.black}`,
            boxShadow: `4px 4px 0 ${COLORS.black}`,
            fontFamily,
            fontSize: 14,
            fontWeight: 700,
            color: COLORS.black,
            textAlign: "left",
            lineHeight: 1.35,
            opacity: tooltipOpacity,
            transform: `translateX(-50%) translateY(${-tooltipTY}px)`,
            zIndex: 3,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.2em",
              color: COLORS.muted,
              marginBottom: 6,
              textTransform: "uppercase",
            }}
          >
            WHAT THIS MEANS
          </div>
          {tooltipText}
        </div>
      ) : null}
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────
function cycleHighlight(
  frame: number,
  cycleStart: number,
  perItem: number,
  itemIndex: number,
  rampIn: number,
  hold: number,
  rampOut: number,
): number {
  const start = cycleStart + itemIndex * perItem;
  const rampInEnd = start + rampIn;
  const holdEnd = rampInEnd + hold;
  const rampOutEnd = holdEnd + rampOut;
  return interpolate(
    frame,
    [start, rampInEnd, holdEnd, rampOutEnd],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
}

// Distribution chip animation: when did this chip's value last change (absolute frame)?
type DistChipKey = "role" | "experience" | "location";
function distChipChangeFrame(key: DistChipKey, slotIdx: number): number {
  const valueOf = (idx: number): string => {
    const s = SCENARIOS[DIST_SCENARIO_SLOTS[idx].scenario];
    if (key === "role") return s.role;
    if (key === "experience") return s.experience;
    return s.location;
  };
  for (let i = slotIdx; i > 0; i--) {
    if (valueOf(i) !== valueOf(i - 1)) {
      return SCENES.distribution.start + DIST_SCENARIO_SLOTS[i].start;
    }
  }
  return SCENES.distribution.start + DIST_SCENARIO_SLOTS[0].start;
}

// Active scenario slot + cross-fade progress.
function activeScenarioSlot(frameInScene: number) {
  for (let i = 0; i < DIST_SCENARIO_SLOTS.length; i++) {
    const slot = DIST_SCENARIO_SLOTS[i];
    if (
      frameInScene >= slot.start &&
      frameInScene < slot.start + slot.duration
    ) {
      const crossfade = interpolate(
        frameInScene,
        [slot.start, slot.start + DIST_CROSSFADE_FRAMES],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
      return { slotIndex: i, slot, crossfade };
    }
  }
  // After last slot, hold last.
  const last = DIST_SCENARIO_SLOTS[DIST_SCENARIO_SLOTS.length - 1];
  return { slotIndex: DIST_SCENARIO_SLOTS.length - 1, slot: last, crossfade: 1 };
}

// Hover index within current scenario slot.
function distributionHover(
  frameInScene: number,
  slotStart: number,
  slotDuration: number,
  scenarioIdx: number,
): { index: number | null; popIn: number } {
  const hoverStart = slotStart + DIST_CROSSFADE_FRAMES;
  const hoverEnd = slotStart + slotDuration;
  const hoverWindow = hoverEnd - hoverStart;
  const perItem = Math.floor(hoverWindow / DIST_HOVER_COUNT);
  const rel = frameInScene - hoverStart;
  if (rel < 0) return { index: null, popIn: 0 };
  const slot = Math.min(DIST_HOVER_COUNT - 1, Math.floor(rel / perItem));
  const indices = hoverIndicesForScenario(scenarioIdx);
  const index = indices[slot];
  const inSlot = rel - slot * perItem;
  const popIn = interpolate(inSlot, [0, 6], [0, 1], {
    easing: easeOutExpo,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { index, popIn };
}

// ── Main ──────────────────────────────────────────────────
export const ComparePage: React.FC = () => {
  const frame = useCurrentFrame();
  const focus = sectionFocus(frame);
  const scrollY = cameraScrollY(frame);

  // Header reveal
  const headerAnim = fadeInUp(frame, SCENES.header.start, 20);

  // Filters arrival + cycle
  const filterArrival = (i: number) =>
    interpolate(
      frame,
      [SCENES.filters.start + i * 6, SCENES.filters.start + i * 6 + 18],
      [0, 1],
      {
        easing: easeOutExpo,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  const filterCycleStart = SCENES.filters.start + 30;
  const filterHighlight = (i: number) =>
    cycleHighlight(frame, filterCycleStart, FILTER_CYCLE_PER_ITEM, i, 8, 34, 8);

  // Distribution scene
  const distFrameInScene = frame - SCENES.distribution.start;
  const activeSlot = activeScenarioSlot(
    Math.max(0, Math.min(SCENES.distribution.duration - 1, distFrameInScene)),
  );
  const activeScenario = SCENARIOS[activeSlot.slot.scenario];
  const distHover = distributionHover(
    Math.max(0, Math.min(SCENES.distribution.duration - 1, distFrameInScene)),
    activeSlot.slot.start,
    activeSlot.slot.duration,
    activeSlot.slot.scenario,
  );

  // Percentile progression (use scenario A)
  const percentileScene = SCENES.percentile.start;
  const percentileProgress = interpolate(
    frame,
    [percentileScene, percentileScene + PERCENTILE_DRAW_FRAMES],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const verdictReveal = interpolate(
    frame,
    [
      percentileScene + PERCENTILE_DRAW_FRAMES - 10,
      percentileScene + PERCENTILE_DRAW_FRAMES + 20,
    ],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Gaps arrival + cycle
  const gapArrival = (i: number) =>
    interpolate(
      frame,
      [SCENES.gaps.start + i * 5, SCENES.gaps.start + i * 5 + 18],
      [0, 1],
      {
        easing: easeOutExpo,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  const gapsCycleStart = SCENES.gaps.start + 10;
  const gapHighlight = (i: number) =>
    cycleHighlight(frame, gapsCycleStart, GAPS_CYCLE_PER_ITEM, i, 12, 70, 13);

  const scenarioA = SCENARIOS[0];
  const cameraTranslate = -scrollY;

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.cream, fontFamily, overflow: "hidden" }}
    >
      <div
        style={{
          width: LAYOUT.PAGE_WIDTH,
          height: PAGE_HEIGHT,
          transform: `translateY(${cameraTranslate}px)`,
        }}
      >
        {/* Header */}
        <div
          style={{
            position: "absolute",
            top: SECTION_Y.header,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            ...headerAnim,
          }}
        >
          <div
            style={{
              width: LAYOUT.CONTENT_WIDTH,
              backgroundColor: COLORS.black,
              borderBottom: `4px solid ${COLORS.red}`,
              padding: "14px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxSizing: "border-box",
              height: LAYOUT.HEADER_HEIGHT,
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 900, color: COLORS.white }}>
              KAZI<span style={{ color: COLORS.red }}>&amp;BUDGET</span>
              <span
                style={{
                  marginLeft: 16,
                  fontSize: 14,
                  letterSpacing: "0.2em",
                  color: COLORS.yellow,
                }}
              >
                / COMPARE
              </span>
            </div>
            <div
              style={{
                border: `2px solid ${COLORS.yellow}`,
                color: COLORS.yellow,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 800,
                transform: "rotate(1deg)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              MARKET BENCHMARK
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            position: "absolute",
            top: SECTION_Y.filters,
            left: 0,
            right: 0,
          }}
        >
          <SectionShell
            stamp="Who You Are"
            stampBg={COLORS.teal}
            stampColor={COLORS.white}
            stampRotate={-1.5}
            stampSide="left"
            accentColor={COLORS.teal}
            height={LAYOUT.FILTERS_HEIGHT}
            focusStrength={focus.filters}
          >
            <SectionHeading text="Your Role, Experience, And Location" />
            <div
              style={{
                display: "flex",
                gap: 28,
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 24,
                paddingBottom: 28,
              }}
            >
              {FILTER_CHIPS.map((chip, i) => (
                <FilterChip
                  key={chip.key}
                  label={chip.label}
                  value={chip.value}
                  color={chip.color}
                  highlight={filterHighlight(i)}
                  reveal={filterArrival(i)}
                  rotate={i === 0 ? -1 : i === 1 ? 1 : -0.5}
                />
              ))}
            </div>
          </SectionShell>
        </div>

        {/* Distribution */}
        <div
          style={{
            position: "absolute",
            top: SECTION_Y.distribution,
            left: 0,
            right: 0,
          }}
        >
          <SectionShell
            stamp="Salary Distribution"
            stampBg={COLORS.yellow}
            stampColor={COLORS.black}
            stampRotate={1.5}
            stampSide="right"
            accentColor={COLORS.yellow}
            height={LAYOUT.DISTRIBUTION_HEIGHT}
            focusStrength={focus.distribution}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <SectionHeading text="How You Compare To The Market" />
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: COLORS.muted,
                  alignItems: "center",
                }}
              >
                <AnimatedDistChip
                  bgColor={COLORS.yellow}
                  textColor={COLORS.black}
                  value={activeScenario.role}
                  frame={frame}
                  changeStart={distChipChangeFrame(
                    "role",
                    activeSlot.slotIndex,
                  )}
                />
                <AnimatedDistChip
                  bgColor={COLORS.blue}
                  textColor={COLORS.white}
                  value={activeScenario.experience}
                  frame={frame}
                  changeStart={distChipChangeFrame(
                    "experience",
                    activeSlot.slotIndex,
                  )}
                />
                <AnimatedDistChip
                  bgColor={COLORS.red}
                  textColor={COLORS.white}
                  value={activeScenario.location}
                  frame={frame}
                  changeStart={distChipChangeFrame(
                    "location",
                    activeSlot.slotIndex,
                  )}
                />
              </div>
            </div>
            <div style={{ width: "100%", height: "100%", marginTop: 4 }}>
              <DistributionChart
                scenario={activeScenario}
                hoverIndex={distHover.index}
                hoverPopIn={distHover.popIn}
                width={LAYOUT.CONTENT_WIDTH - 80}
                height={LAYOUT.DISTRIBUTION_HEIGHT - 140}
                revealProgress={activeSlot.crossfade}
              />
            </div>
          </SectionShell>
        </div>

        {/* Percentile */}
        <div
          style={{
            position: "absolute",
            top: SECTION_Y.percentile,
            left: 0,
            right: 0,
          }}
        >
          <SectionShell
            stamp="Your Result"
            stampBg={COLORS.red}
            stampColor={COLORS.white}
            stampRotate={-1}
            stampSide="left"
            accentColor={COLORS.red}
            height={LAYOUT.PERCENTILE_HEIGHT}
            focusStrength={focus.percentile}
          >
            <SectionHeading text="Where You Sit In The Distribution" />
            <PercentileBar
              percentile={scenarioA.percentile}
              verdict={scenarioA.verdict}
              p25={scenarioA.p25}
              median={scenarioA.median}
              p75={scenarioA.p75}
              progress={percentileProgress}
              revealStamp={verdictReveal}
            />
          </SectionShell>
        </div>

        {/* Gaps */}
        <div
          style={{
            position: "absolute",
            top: SECTION_Y.gaps,
            left: 0,
            right: 0,
          }}
        >
          <SectionShell
            stamp="Gap Analysis"
            stampBg={COLORS.black}
            stampColor={COLORS.white}
            stampRotate={1}
            stampSide="right"
            accentColor={COLORS.red}
            height={LAYOUT.GAPS_HEIGHT}
            focusStrength={focus.gaps}
          >
            <SectionHeading text="What It Would Take To Close The Gap" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 30,
                marginTop: 24,
              }}
            >
              {GAP_CARDS.map((card, i) => (
                <GapCard
                  key={card.key}
                  label={card.label}
                  value={card.valueFn(scenarioA)}
                  accent={card.accent}
                  highlight={gapHighlight(i)}
                  reveal={gapArrival(i)}
                  tooltipText={card.tooltip}
                />
              ))}
            </div>
          </SectionShell>
        </div>
      </div>

      {/* Bottom section tracker */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 14,
            padding: "10px 18px",
            border: `3px solid ${COLORS.black}`,
            backgroundColor: COLORS.white,
            boxShadow: `4px 4px 0 ${COLORS.black}`,
            fontFamily,
          }}
        >
          {(
            [
              ["filters", "FILTERS"],
              ["distribution", "DISTRIBUTION"],
              ["percentile", "PERCENTILE"],
              ["gaps", "GAPS"],
            ] as Array<[Section, string]>
          ).map(([key, label]) => {
            const v = focus[key];
            return (
              <div
                key={key}
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  backgroundColor: v > 0.5 ? COLORS.yellow : "transparent",
                  color: COLORS.black,
                  border: `2px solid ${v > 0.5 ? COLORS.black : `${COLORS.black}33`}`,
                  opacity: interpolate(v, [0, 1], [0.4, 1]),
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Keep these referenced to avoid unused warnings and document intent.
void FILTER_CYCLE_COUNT;
void GAPS_CYCLE_COUNT;
