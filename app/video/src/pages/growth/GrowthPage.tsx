import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { brutalistCard, COLORS, fontFamily, formatKES } from "../../theme";
import { easeOutExpo, fadeInUp } from "../../animations";
import {
  ASSUMPTION_CYCLE_COUNT,
  ASSUMPTION_CYCLE_PER_ITEM,
  CAMERA_Y,
  CHART_HOVER_COUNT,
  CHART_HOVER_PER_ITEM,
  CHART_LINE_DRAW_FRAMES,
  GROWTH_ASSUMPTIONS,
  GROWTH_CHART,
  HOVER_INDICES,
  LAYOUT,
  MILESTONE_CYCLE_COUNT,
  MILESTONE_CYCLE_PER_ITEM,
  MILESTONES,
  PAGE_HEIGHT,
  SCENES,
  SECTION_Y,
} from "./timeline";

// ── helpers ────────────────────────────────────────────────

type Section = "assumptions" | "salaryChart" | "milestones" | "taxesChart";

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
    assumptions: focusAt(SCENES.assumptions.start, SCENES.assumptions.duration),
    salaryChart: focusAt(SCENES.salaryChart.start, SCENES.salaryChart.duration),
    milestones: focusAt(SCENES.milestones.start, SCENES.milestones.duration),
    taxesChart: focusAt(SCENES.taxesChart.start, SCENES.taxesChart.duration),
  };
}

function cameraScrollY(frame: number): number {
  const waypoints = [
    { f: 0, y: CAMERA_Y.assumptions },
    {
      f: SCENES.assumptions.start + 15,
      y: CAMERA_Y.assumptions,
    },
    {
      f: SCENES.assumptions.start + SCENES.assumptions.duration - 20,
      y: CAMERA_Y.assumptions,
    },
    {
      f: SCENES.salaryChart.start + 20,
      y: CAMERA_Y.salaryChart,
    },
    {
      f: SCENES.salaryChart.start + SCENES.salaryChart.duration - 20,
      y: CAMERA_Y.salaryChart,
    },
    {
      f: SCENES.milestones.start + 20,
      y: CAMERA_Y.milestones,
    },
    {
      f: SCENES.milestones.start + SCENES.milestones.duration - 20,
      y: CAMERA_Y.milestones,
    },
    {
      f: SCENES.taxesChart.start + 20,
      y: CAMERA_Y.taxesChart,
    },
    {
      f: SCENES.taxesChart.start + SCENES.taxesChart.duration,
      y: CAMERA_Y.taxesChart,
    },
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

// ── shell wrapper ──────────────────────────────────────────
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

// ── Section heading ────────────────────────────────────────
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

// ── Assumptions ────────────────────────────────────────────
type AssumptionCardProps = {
  label: string;
  value: number;
  accent: string;
  highlight: number; // 0..1
  reveal: number; // 0..1
};

const AssumptionCard: React.FC<AssumptionCardProps> = ({
  label,
  value,
  accent,
  highlight,
  reveal,
}) => {
  const shadow = interpolate(highlight, [0, 1], [4, 8]);
  const lift = interpolate(highlight, [0, 1], [0, -2]);
  const scale = interpolate(highlight, [0, 1], [1, 1.08]);
  return (
    <div
      style={{
        border: `3px solid ${COLORS.black}`,
        borderLeft: `6px solid ${accent}`,
        backgroundColor: COLORS.white,
        padding: 24,
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
          width: 36,
          height: 36,
          backgroundColor: accent,
          marginBottom: 12,
          border: `2px solid ${COLORS.black}`,
        }}
      />
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.15em",
          color: COLORS.muted,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 900,
          marginTop: 6,
          color: COLORS.black,
        }}
      >
        {value.toFixed(1)}
        <span style={{ fontSize: 20, marginLeft: 4, color: COLORS.muted }}>
          %
        </span>
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: COLORS.muted,
          textTransform: "uppercase",
          marginTop: 4,
        }}
      >
        ANNUAL
      </div>
    </div>
  );
};

// ── Milestone card ─────────────────────────────────────────
type MilestoneCardProps = {
  data: (typeof MILESTONES)[number];
  highlight: number; // 0..1
  reveal: number;
};

const MilestoneCard: React.FC<MilestoneCardProps> = ({
  data,
  highlight,
  reveal,
}) => {
  const shadow = interpolate(highlight, [0, 1], [4, 8]);
  const lift = interpolate(highlight, [0, 1], [0, -2]);
  const scale = interpolate(highlight, [0, 1], [1, 1.08]);
  return (
    <div
      style={{
        position: "relative",
        border: `3px solid ${COLORS.black}`,
        borderLeft: `4px solid ${data.color}`,
        backgroundColor: COLORS.white,
        padding: 24,
        paddingTop: 34,
        boxShadow: `${shadow}px ${shadow}px 0 ${COLORS.black}`,
        transform: `translateY(${interpolate(reveal, [0, 1], [24, 0]) + lift}px) scale(${scale}) rotate(${data.rotate}deg)`,
        opacity:
          interpolate(reveal, [0, 1], [0, 1]) *
          interpolate(highlight, [0, 1], [0.35, 1]),
        outline: highlight > 0.4 ? `3px solid ${COLORS.yellow}` : "none",
        outlineOffset: 4,
        fontFamily,
        filter: highlight < 0.3 && reveal > 0.9 ? "blur(0.6px)" : "none",
      }}
    >
      {/* Top-right rotated stamp */}
      <div
        style={{
          position: "absolute",
          top: -14,
          right: -10,
          padding: "5px 12px",
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          backgroundColor: data.color,
          color: data.color === "#F4D35E" ? COLORS.black : COLORS.white,
          border: `2px solid ${COLORS.black}`,
          transform: "rotate(2deg)",
        }}
      >
        {data.label}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.15em",
          color: COLORS.muted,
          textTransform: "uppercase",
        }}
      >
        SALARY
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          marginTop: 2,
          marginBottom: 10,
          color: COLORS.black,
        }}
      >
        {formatKES(data.salary)}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.15em",
          color: COLORS.muted,
          textTransform: "uppercase",
        }}
      >
        TAKE HOME
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          marginTop: 2,
          color: COLORS.teal,
        }}
      >
        {formatKES(data.takeHome)}
      </div>
    </div>
  );
};

// ── Chart primitives ───────────────────────────────────────
type Series = {
  key: string;
  color: string;
  opacity?: number;
  accessor: (row: (typeof GROWTH_CHART)[number]) => number;
};

type TooltipLine = {
  label: string;
  value: string;
  numeric: number;
  color: string;
};

type ChartProps = {
  series: readonly Series[];
  yMax: number;
  drawProgress: number; // 0..1
  hoverIndex: number | null; // index into GROWTH_CHART (0..10)
  hoverSeriesKey: string; // series that the cursor tracks
  hoverPopIn: number; // 0..1
  tooltipLines: (row: (typeof GROWTH_CHART)[number]) => TooltipLine[];
  width: number;
  height: number;
};

const Chart: React.FC<ChartProps> = ({
  series,
  yMax,
  drawProgress,
  hoverIndex,
  hoverSeriesKey,
  hoverPopIn,
  tooltipLines,
  width,
  height,
}) => {
  const padX = 60;
  const padY = 60;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const n = GROWTH_CHART.length;

  const xFor = (i: number) => padX + (i / (n - 1)) * innerW;
  const yFor = (v: number) => padY + innerH - (v / yMax) * innerH;

  // Build path strings per series.
  const pathFor = (s: Series) => {
    let d = "";
    GROWTH_CHART.forEach((row, i) => {
      const x = xFor(i);
      const y = yFor(s.accessor(row));
      d += i === 0 ? `M ${x.toFixed(2)},${y.toFixed(2)}` : ` L ${x.toFixed(2)},${y.toFixed(2)}`;
    });
    return d;
  };

  // Gridlines (5 horizontal)
  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const yLabels = gridLines.map((frac) => {
    const v = yMax * (1 - frac);
    return { y: padY + frac * innerH, label: `${Math.round(v / 1000)}k` };
  });

  const LEN = 3000;
  const dashOffset = interpolate(drawProgress, [0, 1], [LEN, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cursor + tooltip position
  let cursorX = 0;
  let cursorY = 0;
  let cursorColor: string = COLORS.black;
  let tooltipX = 0;
  let tooltipAlign: "start" | "end" | "middle" = "middle";
  let tooltipLinesData: TooltipLine[] = [];
  let tooltipRow: (typeof GROWTH_CHART)[number] | null = null;
  const hoverSeries = series.find((s) => s.key === hoverSeriesKey) ?? series[0];

  if (hoverIndex !== null) {
    tooltipRow = GROWTH_CHART[hoverIndex];
    cursorX = xFor(hoverIndex);
    cursorY = yFor(hoverSeries.accessor(tooltipRow));
    cursorColor = hoverSeries.color;
    tooltipX = cursorX;
    // Offset horizontally if near right edge to avoid clipping.
    if (hoverIndex >= n - 2) {
      tooltipAlign = "end";
    } else if (hoverIndex <= 1) {
      tooltipAlign = "start";
    }
    tooltipLinesData = tooltipLines(tooltipRow)
      .slice()
      .sort((a, b) => b.numeric - a.numeric);
  }

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
      {/* X-axis year labels */}
      {GROWTH_CHART.map((row, i) => (
        <text
          key={`xl-${row.year}`}
          x={xFor(i)}
          y={height - padY + 22}
          textAnchor="middle"
          fontSize={12}
          fontWeight={800}
          fill={COLORS.muted}
          style={{ fontFamily }}
        >
          Y{row.year}
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
      {/* Series lines */}
      {series.map((s) => (
        <path
          key={s.key}
          d={pathFor(s)}
          fill="none"
          stroke={s.color}
          strokeWidth={5}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={LEN}
          strokeDashoffset={dashOffset}
          opacity={s.opacity ?? 1}
        />
      ))}

      {/* Cursor + tooltip */}
      {hoverIndex !== null && tooltipRow ? (
        <g opacity={hoverPopIn}>
          {/* Vertical guide */}
          <line
            x1={cursorX}
            x2={cursorX}
            y1={padY}
            y2={height - padY}
            stroke={COLORS.black}
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.3}
          />
          <circle
            cx={cursorX}
            cy={cursorY}
            r={10 * interpolate(hoverPopIn, [0, 1], [0.4, 1])}
            fill={cursorColor}
            stroke={COLORS.black}
            strokeWidth={3}
          />
        </g>
      ) : null}

      {/* Tooltip as HTML via foreignObject-ish; use SVG text + rect for crispness */}
      {hoverIndex !== null && tooltipRow ? (
        (() => {
          const tooltipW = 320;
          const headingH = 48;
          const rowH = 36;
          const tooltipH = headingH + tooltipLinesData.length * rowH + 10;
          const gapAbove = 40;
          let tx = tooltipX - tooltipW / 2;
          if (tooltipAlign === "end") tx = tooltipX - tooltipW + 18;
          if (tooltipAlign === "start") tx = tooltipX - 18;
          // Clamp horizontally
          tx = Math.max(padX, Math.min(width - padX - tooltipW, tx));
          const ty = Math.max(padY - 2, cursorY - gapAbove - tooltipH);
          return (
            <g opacity={hoverPopIn}>
              {/* Shadow */}
              <rect
                x={tx + 6}
                y={ty + 6}
                width={tooltipW}
                height={tooltipH}
                fill={COLORS.black}
              />
              {/* Body */}
              <rect
                x={tx}
                y={ty}
                width={tooltipW}
                height={tooltipH}
                fill={COLORS.white}
                stroke={COLORS.black}
                strokeWidth={4}
              />
              {/* Year heading */}
              <text
                x={tx + 20}
                y={ty + 34}
                fontSize={22}
                fontWeight={900}
                letterSpacing={3}
                fill={COLORS.black}
                style={{ fontFamily }}
              >
                YEAR {tooltipRow.year}
              </text>
              {/* Divider under heading */}
              <line
                x1={tx + 20}
                x2={tx + tooltipW - 20}
                y1={ty + headingH - 4}
                y2={ty + headingH - 4}
                stroke={COLORS.black}
                strokeWidth={2}
                opacity={0.25}
              />
              {tooltipLinesData.map((ln, i) => (
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

// ── Hover helpers ──────────────────────────────────────────
function computeHover(
  frame: number,
  sceneStart: number,
): { index: number | null; popIn: number } {
  const hoverStart = sceneStart + CHART_LINE_DRAW_FRAMES;
  const rel = frame - hoverStart;
  if (rel < 0) return { index: null, popIn: 0 };
  const slot = Math.floor(rel / CHART_HOVER_PER_ITEM);
  const clamped = Math.min(CHART_HOVER_COUNT - 1, slot);
  const index = HOVER_INDICES[clamped];
  const inSlot = rel - clamped * CHART_HOVER_PER_ITEM;
  const popIn = interpolate(inSlot, [0, 6], [0, 1], {
    easing: easeOutExpo,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { index, popIn };
}

// ── Main ───────────────────────────────────────────────────
export const GrowthPage: React.FC = () => {
  const frame = useCurrentFrame();
  const focus = sectionFocus(frame);
  const scrollY = cameraScrollY(frame);

  // Header reveal
  const headerAnim = fadeInUp(frame, SCENES.header.start, 20);

  // Assumptions reveal (grid of 4)
  const assumptionsArrival = (i: number) =>
    interpolate(
      frame,
      [
        SCENES.assumptions.start + i * 5,
        SCENES.assumptions.start + i * 5 + 18,
      ],
      [0, 1],
      {
        easing: easeOutExpo,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  const assumptionsCycleStart = SCENES.assumptions.start + 30;
  const assumptionHighlight = (i: number) => {
    const start = assumptionsCycleStart + i * ASSUMPTION_CYCLE_PER_ITEM;
    const rampInEnd = start + 8;
    const holdEnd = rampInEnd + 22;
    const rampOutEnd = holdEnd + 5;
    return interpolate(
      frame,
      [start, rampInEnd, holdEnd, rampOutEnd],
      [0, 1, 1, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  };

  // Salary chart scene
  const salaryScene = SCENES.salaryChart.start;
  const salaryDrawProgress = interpolate(
    frame,
    [salaryScene, salaryScene + CHART_LINE_DRAW_FRAMES],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const salaryHover = computeHover(frame, salaryScene);

  // Milestones
  const milestoneArrival = (i: number) =>
    interpolate(
      frame,
      [
        SCENES.milestones.start + i * 5,
        SCENES.milestones.start + i * 5 + 18,
      ],
      [0, 1],
      {
        easing: easeOutExpo,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  const milestoneCycleStart = SCENES.milestones.start + 30;
  const milestoneHighlight = (i: number) => {
    const start = milestoneCycleStart + i * MILESTONE_CYCLE_PER_ITEM;
    const rampInEnd = start + 10;
    const holdEnd = rampInEnd + 28;
    const rampOutEnd = holdEnd + 7;
    return interpolate(
      frame,
      [start, rampInEnd, holdEnd, rampOutEnd],
      [0, 1, 1, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  };

  // Taxes chart scene
  const taxesScene = SCENES.taxesChart.start;
  const taxesDrawProgress = interpolate(
    frame,
    [taxesScene, taxesScene + CHART_LINE_DRAW_FRAMES],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const taxesHover = computeHover(frame, taxesScene);

  // Y-axis max for salary chart (rounded up to nearest 50k).
  const salaryMaxRaw = GROWTH_CHART[GROWTH_CHART.length - 1].salary;
  const salaryYMax = Math.ceil(salaryMaxRaw / 50000) * 50000;

  // Y-axis max for taxes chart (takeHome[10])
  const taxesMaxRaw = Math.max(
    ...GROWTH_CHART.map((r) => Math.max(r.takeHome, r.taxes)),
  );
  const taxesYMax = Math.ceil(taxesMaxRaw / 10000) * 10000;

  const salarySeries: readonly Series[] = [
    {
      key: "expenses",
      color: "#457B9D",
      opacity: 0.5,
      accessor: (r) => r.expenses,
    },
    {
      key: "takeHome",
      color: COLORS.teal,
      opacity: 1,
      accessor: (r) => r.takeHome,
    },
    {
      key: "salary",
      color: COLORS.yellow,
      opacity: 0.85,
      accessor: (r) => r.salary,
    },
  ];

  const taxesSeries: readonly Series[] = [
    {
      key: "takeHome",
      color: COLORS.teal,
      opacity: 1,
      accessor: (r) => r.takeHome,
    },
    {
      key: "taxes",
      color: COLORS.red,
      opacity: 1,
      accessor: (r) => r.taxes,
    },
  ];

  const cameraTranslate = -scrollY;

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.cream, fontFamily, overflow: "hidden" }}
    >
      {/* Camera / page container */}
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
              borderBottom: `4px solid ${COLORS.teal}`,
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
                / GROWTH
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
              10-YEAR PROJECTION
            </div>
          </div>
        </div>

        {/* Assumptions */}
        <div
          style={{
            position: "absolute",
            top: SECTION_Y.assumptions,
            left: 0,
            right: 0,
          }}
        >
          <SectionShell
            stamp="Growth Assumptions"
            stampBg={COLORS.teal}
            stampColor={COLORS.white}
            stampRotate={-1.5}
            stampSide="left"
            accentColor={COLORS.teal}
            height={LAYOUT.ASSUMPTIONS_HEIGHT}
            focusStrength={focus.assumptions}
          >
            <SectionHeading text="Annual Rates Driving The Forecast" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 20,
              }}
            >
              {GROWTH_ASSUMPTIONS.map((a, i) => (
                <AssumptionCard
                  key={a.label}
                  label={a.label}
                  value={a.value}
                  accent={a.color}
                  highlight={assumptionHighlight(i)}
                  reveal={assumptionsArrival(i)}
                />
              ))}
            </div>
          </SectionShell>
        </div>

        {/* Salary chart */}
        <div
          style={{
            position: "absolute",
            top: SECTION_Y.salaryChart,
            left: 0,
            right: 0,
          }}
        >
          <SectionShell
            stamp="Salary vs Take-Home"
            stampBg={COLORS.yellow}
            stampColor={COLORS.black}
            stampRotate={1.5}
            stampSide="right"
            accentColor={COLORS.yellow}
            height={LAYOUT.SALARY_CHART_HEIGHT}
            focusStrength={focus.salaryChart}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <SectionHeading text="Projected 10-Year Trajectory" />
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: COLORS.muted,
                }}
              >
                <LegendSwatch color={COLORS.yellow} label="SALARY" />
                <LegendSwatch color={COLORS.teal} label="TAKE HOME" />
                <LegendSwatch color="#457B9D" label="EXPENSES" />
              </div>
            </div>
            <div style={{ width: "100%", height: "100%", marginTop: 4 }}>
              <Chart
                series={salarySeries}
                yMax={salaryYMax}
                drawProgress={salaryDrawProgress}
                hoverIndex={salaryHover.index}
                hoverSeriesKey="salary"
                hoverPopIn={salaryHover.popIn}
                tooltipLines={(row) => [
                  {
                    label: "SALARY",
                    value: formatKES(row.salary),
                    numeric: row.salary,
                    color: COLORS.yellow,
                  },
                  {
                    label: "TAKE HOME",
                    value: formatKES(row.takeHome),
                    numeric: row.takeHome,
                    color: COLORS.teal,
                  },
                  {
                    label: "EXPENSES",
                    value: formatKES(row.expenses),
                    numeric: row.expenses,
                    color: "#457B9D",
                  },
                ]}
                width={LAYOUT.CONTENT_WIDTH - 80}
                height={LAYOUT.SALARY_CHART_HEIGHT - 130}
              />
            </div>
          </SectionShell>
        </div>

        {/* Milestones */}
        <div
          style={{
            position: "absolute",
            top: SECTION_Y.milestones,
            left: 0,
            right: 0,
          }}
        >
          <SectionShell
            stamp="Career Milestones"
            stampBg={COLORS.red}
            stampColor={COLORS.white}
            stampRotate={-1}
            stampSide="left"
            accentColor={COLORS.red}
            height={LAYOUT.MILESTONES_HEIGHT}
            focusStrength={focus.milestones}
          >
            <SectionHeading text="Where You Stand At Key Points" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 24,
                marginTop: 8,
              }}
            >
              {MILESTONES.map((m, i) => (
                <MilestoneCard
                  key={m.label}
                  data={m}
                  highlight={milestoneHighlight(i)}
                  reveal={milestoneArrival(i)}
                />
              ))}
            </div>
          </SectionShell>
        </div>

        {/* Taxes chart */}
        <div
          style={{
            position: "absolute",
            top: SECTION_Y.taxesChart,
            left: 0,
            right: 0,
          }}
        >
          <SectionShell
            stamp="Taxes vs Take-Home"
            stampBg={COLORS.black}
            stampColor={COLORS.white}
            stampRotate={1}
            stampSide="right"
            accentColor={COLORS.red}
            height={LAYOUT.TAXES_CHART_HEIGHT}
            focusStrength={focus.taxesChart}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <SectionHeading text="Tax Burden Over Time" />
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: COLORS.muted,
                }}
              >
                <LegendSwatch color={COLORS.teal} label="TAKE HOME" />
                <LegendSwatch color={COLORS.red} label="TAXES" />
              </div>
            </div>
            <div style={{ width: "100%", height: "100%", marginTop: 4 }}>
              <Chart
                series={taxesSeries}
                yMax={taxesYMax}
                drawProgress={taxesDrawProgress}
                hoverIndex={taxesHover.index}
                hoverSeriesKey="takeHome"
                hoverPopIn={taxesHover.popIn}
                tooltipLines={(row) => [
                  {
                    label: "TAKE HOME",
                    value: formatKES(row.takeHome),
                    numeric: row.takeHome,
                    color: COLORS.teal,
                  },
                  {
                    label: "TAXES",
                    value: formatKES(row.taxes),
                    numeric: row.taxes,
                    color: COLORS.red,
                  },
                ]}
                width={LAYOUT.CONTENT_WIDTH - 80}
                height={LAYOUT.TAXES_CHART_HEIGHT - 130}
              />
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
              ["assumptions", "ASSUMPTIONS"],
              ["salaryChart", "SALARY"],
              ["milestones", "MILESTONES"],
              ["taxesChart", "TAXES"],
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

// Small legend swatch
const LegendSwatch: React.FC<{ color: string; label: string }> = ({
  color,
  label,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span
      style={{
        width: 14,
        height: 14,
        backgroundColor: color,
        border: `2px solid ${COLORS.black}`,
      }}
    />
    <span>{label}</span>
  </div>
);

// Note: ASSUMPTION_CYCLE_COUNT / MILESTONE_CYCLE_COUNT are driven via GROWTH_ASSUMPTIONS.length
// and MILESTONES.length which are equal to 4 each; the constants are used here implicitly.
void ASSUMPTION_CYCLE_COUNT;
void MILESTONE_CYCLE_COUNT;
