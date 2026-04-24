import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { brutalistCard, COLORS, fontFamily, formatKES } from "../../theme";
import { countUp, easeOutExpo, pulse, typed } from "../../animations";
import {
  CAMERA_Y,
  DEDUCTIONS,
  EXPENSES_TOTAL,
  FOOD_AFTER,
  FOOD_BEFORE,
  FOOD_EDIT_CHAR_FRAMES,
  FOOD_EDIT_ERASE_AT,
  FOOD_EDIT_RETYPE_AT,
  FOOD_RECALC_AT,
  FOOD_RECALC_DURATION,
  GROSS,
  LAYOUT,
  PAGE_HEIGHT,
  PIE_CYCLE_INDICES,
  PIE_CYCLE_PER_ITEM,
  PIE_ITEMS,
  RENT_AFTER,
  RENT_BEFORE,
  RENT_EDIT_CHAR_FRAMES,
  RENT_EDIT_ERASE_AT,
  RENT_EDIT_RETYPE_AT,
  RENT_RECALC_AT,
  RENT_RECALC_DURATION,
  SAVINGS_RATE,
  SCENES,
  SECTION_Y,
  TAKE_HOME,
} from "./timeline";

// ── helpers ────────────────────────────────────────────────

type Section = "cards" | "savings" | "pie" | "rent" | "food";

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
    cards: focusAt(SCENES.cards.start, SCENES.cards.duration * 0.75),
    savings: focusAt(
      SCENES.cards.start + SCENES.cards.duration * 0.7,
      SCENES.cards.duration * 0.3 + 30,
    ),
    pie: focusAt(SCENES.pie.start, SCENES.pie.duration),
    rent: focusAt(SCENES.rent.start, SCENES.rent.duration),
    food: focusAt(SCENES.food.start, SCENES.food.duration),
  };
}

function cameraScrollY(frame: number): number {
  const waypoints = [
    { f: 0, y: CAMERA_Y.cards },
    { f: SCENES.calcIntro.duration, y: CAMERA_Y.cards },
    { f: SCENES.cards.start + 15, y: CAMERA_Y.cards },
    { f: SCENES.cards.start + SCENES.cards.duration * 0.65, y: CAMERA_Y.cards },
    { f: SCENES.cards.start + SCENES.cards.duration * 0.78, y: CAMERA_Y.savings },
    { f: SCENES.cards.start + SCENES.cards.duration, y: CAMERA_Y.savings },
    { f: SCENES.pie.start + 18, y: CAMERA_Y.pie },
    { f: SCENES.pie.start + SCENES.pie.duration - 18, y: CAMERA_Y.pie },
    { f: SCENES.rent.start + 18, y: CAMERA_Y.rent },
    { f: SCENES.rent.start + SCENES.rent.duration - 18, y: CAMERA_Y.rent },
    { f: SCENES.food.start + 18, y: CAMERA_Y.food },
    { f: SCENES.food.start + SCENES.food.duration, y: CAMERA_Y.food },
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
  const shadowDepth = interpolate(focusStrength, [0, 1], [4, 10]);
  const dim = interpolate(focusStrength, [0, 1], [0.3, 1]);
  const blur = interpolate(focusStrength, [0, 1], [1.6, 0]);
  return (
    <div
      style={{
        position: "relative",
        height,
        width: LAYOUT.CONTENT_WIDTH,
        margin: "0 auto",
        opacity: dim,
        filter: `blur(${blur}px)`,
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

// ── SummaryCard ────────────────────────────────────────────
type SummaryCardProps = {
  label: string;
  value: number;
  accent: string;
  highlight: number; // 0..1
  reveal: number; // 0..1
};

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  accent,
  highlight,
  reveal,
}) => (
  <div
    style={{
      border: `3px solid ${COLORS.black}`,
      borderLeft: `6px solid ${accent}`,
      backgroundColor: COLORS.white,
      padding: 24,
      boxShadow: `${interpolate(highlight, [0, 1], [4, 12])}px ${interpolate(highlight, [0, 1], [4, 12])}px 0 ${COLORS.black}`,
      transform: `translateY(${interpolate(reveal, [0, 1], [24, 0]) + interpolate(highlight, [0, 1], [0, -6])}px) scale(${interpolate(highlight, [0, 1], [1, 1.06])})`,
      opacity: interpolate(reveal, [0, 1], [0, 1]) * interpolate(highlight, [0, 1], [0.35, 1]),
      outline: highlight > 0.4 ? `4px solid ${COLORS.yellow}` : "none",
      outlineOffset: 4,
      fontFamily,
      filter: highlight < 0.3 && reveal > 0.9 ? "blur(0.8px)" : "none",
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        backgroundColor: accent,
        marginBottom: 12,
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
        fontSize: 28,
        fontWeight: 900,
        marginTop: 6,
        color: COLORS.black,
      }}
    >
      {formatKES(value)}
    </div>
  </div>
);

// ── Pie chart ──────────────────────────────────────────────
type PieChartProps = {
  highlightedIdx: number | null;
  introProgress: number; // 0..1 — strokeDashoffset reveal
};

const PieChart: React.FC<PieChartProps> = ({ highlightedIdx, introProgress }) => {
  const size = 360;
  const strokeWidth = 90;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const total = PIE_ITEMS.reduce((s, it) => s + it.value, 0);

  let accumulatedAngle = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background ring */}
      <circle
        r={radius}
        cx={center}
        cy={center}
        fill="none"
        stroke={`${COLORS.black}18`}
        strokeWidth={strokeWidth}
      />
      {PIE_ITEMS.map((item, i) => {
        const fraction = item.value / total;
        const segmentLength = fraction * circumference;
        const rotation = -90 + accumulatedAngle * 360;
        accumulatedAngle += fraction;
        const isDim =
          highlightedIdx !== null && highlightedIdx !== i;
        const offset = interpolate(
          introProgress,
          [0, 1],
          [segmentLength, 0],
          {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );
        return (
          <circle
            key={item.name}
            r={radius}
            cx={center}
            cy={center}
            fill="none"
            stroke={item.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${segmentLength} ${circumference}`}
            strokeDashoffset={offset}
            transform={`rotate(${rotation} ${center} ${center})`}
            opacity={isDim ? 0.12 : 1}
          />
        );
      })}
      {/* Center label */}
      {highlightedIdx !== null ? (
        <g>
          <text
            x={center}
            y={center - 6}
            textAnchor="middle"
            fontSize={14}
            fontWeight={800}
            letterSpacing={2}
            fill={COLORS.muted}
            style={{ fontFamily }}
          >
            {PIE_ITEMS[highlightedIdx].name}
          </text>
          <text
            x={center}
            y={center + 22}
            textAnchor="middle"
            fontSize={28}
            fontWeight={900}
            fill={COLORS.black}
            style={{ fontFamily }}
          >
            {((PIE_ITEMS[highlightedIdx].value / total) * 100).toFixed(1)}%
          </text>
        </g>
      ) : null}
    </svg>
  );
};

// ── Rent / Food list ───────────────────────────────────────
type RentOption = { type: string; median: number };
type FoodOption = { name: string; avgMeal: number };

const RentList: React.FC<{
  options: readonly RentOption[];
  recalcProgress: number; // 0..1 fade/swap
}> = ({ options, recalcProgress }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {options.map((opt, i) => (
      <div
        key={opt.type}
        style={{
          border: `3px solid ${COLORS.black}`,
          backgroundColor: COLORS.white,
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: interpolate(
            recalcProgress,
            [0, 0.3, 0.6, 1],
            [1, 0.2, 0.4, 1],
          ),
          transform: `translateY(${interpolate(
            recalcProgress,
            [0, 0.3, 0.6, 1],
            [0, -8 - i * 2, 8 + i * 2, 0],
          )}px)`,
        }}
      >
        <span
          style={{
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: "0.05em",
          }}
        >
          — {opt.type}
        </span>
        <span style={{ fontWeight: 900, fontSize: 20 }}>
          {formatKES(opt.median)}
        </span>
      </div>
    ))}
  </div>
);

const FoodList: React.FC<{
  options: readonly FoodOption[];
  recalcProgress: number;
}> = ({ options, recalcProgress }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {options.map((o, i) => (
      <div
        key={o.name}
        style={{
          border: `3px solid ${COLORS.black}`,
          backgroundColor: COLORS.white,
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: interpolate(
            recalcProgress,
            [0, 0.3, 0.6, 1],
            [1, 0.2, 0.4, 1],
          ),
          transform: `translateY(${interpolate(
            recalcProgress,
            [0, 0.3, 0.6, 1],
            [0, -8 - i * 2, 8 + i * 2, 0],
          )}px)`,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 15 }}>— {o.name}</span>
        <span style={{ fontWeight: 900, fontSize: 20 }}>
          {formatKES(o.avgMeal)}
        </span>
      </div>
    ))}
  </div>
);

// ── Main ───────────────────────────────────────────────────

export const DashboardPage: React.FC = () => {
  const frame = useCurrentFrame();
  const focus = sectionFocus(frame);
  const scrollY = cameraScrollY(frame);

  // ── Calc intro (press + white flash) ─────────────────────
  const calcIntroStart = 0;
  const calcPressStart = calcIntroStart + 18;
  const calcFlashStart = calcIntroStart + 36;
  const calcFlashEnd = calcIntroStart + 60;
  const calcButtonHighlight = interpolate(
    frame,
    [calcIntroStart, calcIntroStart + 12],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const calcButtonPress = interpolate(
    frame,
    [calcPressStart, calcPressStart + 4, calcPressStart + 14],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const whiteFlash = interpolate(
    frame,
    [calcFlashStart, calcFlashStart + 4, calcFlashEnd],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const dashboardEmergeOpacity = interpolate(
    frame,
    [calcFlashStart + 2, calcFlashEnd + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ── Summary card values count-up ─────────────────────────
  const cardsStart = SCENES.cards.start;
  const cardReveal = (i: number) =>
    interpolate(
      frame,
      [cardsStart + i * 5, cardsStart + i * 5 + 18],
      [0, 1],
      {
        easing: easeOutExpo,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  const grossVal = countUp(frame, cardsStart, 35, GROSS);
  const deductionsVal = countUp(frame, cardsStart + 5, 35, DEDUCTIONS);
  const expensesVal = countUp(frame, cardsStart + 10, 35, EXPENSES_TOTAL);
  const takehomeVal = countUp(frame, cardsStart + 15, 35, TAKE_HOME);

  // Card highlight cycle starts right after arrival.
  const cardCycleStart = cardsStart + 30;
  const cardCycleDuration = 40;
  const highlightFor = (i: number) => {
    const start = cardCycleStart + i * cardCycleDuration;
    return interpolate(
      frame,
      [
        start - 6,
        start,
        start + cardCycleDuration - 6,
        start + cardCycleDuration,
      ],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  };
  const grossHL = highlightFor(0);
  const deductHL = highlightFor(1);
  const expHL = highlightFor(2);
  const takeHL = highlightFor(3);

  // Savings rate pulses near the end of cards scene
  const savingsPulseAt = cardsStart + SCENES.cards.duration * 0.82;
  const savingsScale = pulse(frame, savingsPulseAt, 22);
  const savingsReveal = interpolate(
    frame,
    [savingsPulseAt - 18, savingsPulseAt],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // ── Pie chart cycle ──────────────────────────────────────
  const pieStart = SCENES.pie.start;
  const pieIntroProgress = interpolate(
    frame,
    [pieStart, pieStart + 30],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const pieCycleStart = pieStart + 35;
  const pieItemFrame = frame - pieCycleStart;
  let highlightedPieIdx: number | null = null;
  if (pieItemFrame >= 0) {
    const idx = Math.floor(pieItemFrame / PIE_CYCLE_PER_ITEM);
    if (idx < PIE_CYCLE_INDICES.length) {
      highlightedPieIdx = PIE_CYCLE_INDICES[idx];
    }
  }

  // ── Rent scene ───────────────────────────────────────────
  const rentStart = SCENES.rent.start;
  const rentEraseStart = rentStart + RENT_EDIT_ERASE_AT;
  const rentEraseDuration = 18;
  const rentRetypeStart = rentStart + RENT_EDIT_RETYPE_AT;
  const rentRecalcStart = rentStart + RENT_RECALC_AT;

  let homeAreaDisplay: string = RENT_BEFORE.area;
  if (frame >= rentEraseStart && frame < rentRetypeStart) {
    const erased = Math.min(
      RENT_BEFORE.area.length,
      Math.floor(
        ((frame - rentEraseStart) / rentEraseDuration) * RENT_BEFORE.area.length,
      ),
    );
    homeAreaDisplay = RENT_BEFORE.area.slice(0, RENT_BEFORE.area.length - erased);
  } else if (frame >= rentRetypeStart) {
    homeAreaDisplay = typed(
      frame,
      rentRetypeStart,
      RENT_AFTER.area,
      RENT_EDIT_CHAR_FRAMES,
    );
  }
  const rentEditingCaret = frame >= rentEraseStart && frame <= rentRetypeStart + RENT_AFTER.area.length * RENT_EDIT_CHAR_FRAMES + 6;
  const rentRecalcProgress = interpolate(
    frame,
    [rentRecalcStart, rentRecalcStart + RENT_RECALC_DURATION],
    [0, 1],
    {
      easing: Easing.bezier(0.45, 0, 0.55, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const rentOptions =
    rentRecalcProgress >= 0.5 ? RENT_AFTER.options : RENT_BEFORE.options;
  const rentAreaLabel =
    rentRecalcProgress >= 0.5 ? RENT_AFTER.area : RENT_BEFORE.area;

  // ── Food scene ───────────────────────────────────────────
  const foodStart = SCENES.food.start;
  const foodEraseStart = foodStart + FOOD_EDIT_ERASE_AT;
  const foodEraseDuration = 18;
  const foodRetypeStart = foodStart + FOOD_EDIT_RETYPE_AT;
  const foodRecalcStart = foodStart + FOOD_RECALC_AT;

  let workLocationDisplay: string = FOOD_BEFORE.area;
  if (frame >= foodEraseStart && frame < foodRetypeStart) {
    const erased = Math.min(
      FOOD_BEFORE.area.length,
      Math.floor(
        ((frame - foodEraseStart) / foodEraseDuration) * FOOD_BEFORE.area.length,
      ),
    );
    workLocationDisplay = FOOD_BEFORE.area.slice(
      0,
      FOOD_BEFORE.area.length - erased,
    );
  } else if (frame >= foodRetypeStart) {
    workLocationDisplay = typed(
      frame,
      foodRetypeStart,
      FOOD_AFTER.area,
      FOOD_EDIT_CHAR_FRAMES,
    );
  }
  const foodEditingCaret =
    frame >= foodEraseStart &&
    frame <= foodRetypeStart + FOOD_AFTER.area.length * FOOD_EDIT_CHAR_FRAMES + 6;
  const foodRecalcProgress = interpolate(
    frame,
    [foodRecalcStart, foodRecalcStart + FOOD_RECALC_DURATION],
    [0, 1],
    {
      easing: Easing.bezier(0.45, 0, 0.55, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const foodOptions =
    foodRecalcProgress >= 0.5 ? FOOD_AFTER.options : FOOD_BEFORE.options;
  const foodAreaLabel =
    foodRecalcProgress >= 0.5 ? FOOD_AFTER.area : FOOD_BEFORE.area;

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
          opacity: dashboardEmergeOpacity,
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
              AMANI WANJIKU — SOFTWARE ENGINEER
            </div>
          </div>
        </div>

        {/* Summary cards + savings rate */}
        <div
          style={{ position: "absolute", top: SECTION_Y.cards, left: 0, right: 0 }}
        >
          <div
            style={{
              width: LAYOUT.CONTENT_WIDTH,
              margin: "0 auto",
              opacity: interpolate(focus.cards, [0, 1], [0.3, 1]),
              filter: `blur(${interpolate(focus.cards, [0, 1], [1.6, 0])}px)`,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 20,
              }}
            >
              <SummaryCard
                label="GROSS"
                value={grossVal}
                accent={COLORS.blue}
                highlight={grossHL}
                reveal={cardReveal(0)}
              />
              <SummaryCard
                label="DEDUCTIONS"
                value={deductionsVal}
                accent={COLORS.red}
                highlight={deductHL}
                reveal={cardReveal(1)}
              />
              <SummaryCard
                label="EXPENSES"
                value={expensesVal}
                accent={COLORS.yellow}
                highlight={expHL}
                reveal={cardReveal(2)}
              />
              <SummaryCard
                label="TAKE HOME"
                value={takehomeVal}
                accent={COLORS.teal}
                highlight={takeHL}
                reveal={cardReveal(3)}
              />
            </div>
          </div>
        </div>

        {/* Savings rate stamp */}
        <div
          style={{
            position: "absolute",
            top: SECTION_Y.savings,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              opacity:
                interpolate(focus.savings, [0, 1], [0.3, 1]) * savingsReveal,
              filter: `blur(${interpolate(focus.savings, [0, 1], [1.6, 0])}px)`,
              transform: `scale(${savingsScale}) rotate(-1.5deg)`,
              border: `4px solid ${COLORS.black}`,
              backgroundColor: COLORS.yellow,
              boxShadow: `10px 10px 0 ${COLORS.black}`,
              padding: "36px 72px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Monthly Savings Rate
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                marginTop: 6,
                color: COLORS.black,
              }}
            >
              {SAVINGS_RATE.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Pie chart + breakdown */}
        <div
          style={{ position: "absolute", top: SECTION_Y.pie, left: 0, right: 0 }}
        >
          <SectionShell
            stamp="Where Your Money Goes"
            stampBg={COLORS.red}
            stampColor={COLORS.white}
            stampRotate={-1}
            stampSide="left"
            accentColor={COLORS.red}
            height={LAYOUT.PIE_BREAKDOWN_HEIGHT}
            focusStrength={focus.pie}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "400px 1fr",
                gap: 48,
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PieChart
                  highlightedIdx={highlightedPieIdx}
                  introProgress={pieIntroProgress}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: COLORS.muted,
                    paddingBottom: 10,
                    borderBottom: `3px solid ${COLORS.black}`,
                    display: "grid",
                    gridTemplateColumns: "1fr 140px 60px",
                    marginBottom: 8,
                  }}
                >
                  <span>Item</span>
                  <span style={{ textAlign: "right" }}>Amount</span>
                  <span style={{ textAlign: "right" }}>%</span>
                </div>
                {PIE_ITEMS.slice(0, 7).map((item, i) => {
                  const total = PIE_ITEMS.reduce((s, it) => s + it.value, 0);
                  const pct = ((item.value / total) * 100).toFixed(1);
                  const isHighlighted = highlightedPieIdx === i;
                  return (
                    <div
                      key={item.name}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 140px 60px",
                        alignItems: "center",
                        padding: "12px 8px",
                        borderBottom: `1px solid ${COLORS.black}20`,
                        backgroundColor: isHighlighted
                          ? `rgba(244, 211, 94, 0.35)`
                          : "transparent",
                        outline: isHighlighted
                          ? `3px solid ${COLORS.yellow}`
                          : "none",
                        outlineOffset: -3,
                        opacity:
                          highlightedPieIdx !== null && !isHighlighted
                            ? 0.35
                            : 1,
                        fontFamily,
                        transform: isHighlighted ? "translateX(6px)" : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                          fontSize: 15,
                          fontWeight: 800,
                        }}
                      >
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            backgroundColor: item.color,
                            border: `1px solid ${COLORS.black}`,
                            flexShrink: 0,
                          }}
                        />
                        {item.name}
                      </div>
                      <span
                        style={{
                          textAlign: "right",
                          fontWeight: 800,
                          fontSize: 16,
                        }}
                      >
                        {formatKES(item.value)}
                      </span>
                      <span
                        style={{
                          textAlign: "right",
                          fontWeight: 700,
                          fontSize: 14,
                          color: COLORS.muted,
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionShell>
        </div>

        {/* Rent scene: home-area input + Rent card */}
        <div
          style={{ position: "absolute", top: SECTION_Y.rent, left: 0, right: 0 }}
        >
          <SectionShell
            stamp="Rent in Your Area"
            stampBg={COLORS.blue}
            stampColor={COLORS.white}
            stampRotate={-1.5}
            stampSide="left"
            accentColor={COLORS.blue}
            height={LAYOUT.RENT_HEIGHT}
            focusStrength={focus.rent}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "380px 1fr",
                gap: 36,
                height: "100%",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                    color: COLORS.muted,
                  }}
                >
                  Home Area
                </div>
                <div
                  style={{
                    border: `3px solid ${COLORS.black}`,
                    backgroundColor: COLORS.white,
                    padding: "14px 18px",
                    fontWeight: 700,
                    fontSize: 22,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span>{homeAreaDisplay}</span>
                  {rentEditingCaret ? (
                    <span
                      style={{
                        marginLeft: 2,
                        width: 2,
                        height: 24,
                        backgroundColor: COLORS.black,
                      }}
                    />
                  ) : null}
                </div>
                <div
                  style={{
                    marginTop: 20,
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    color: COLORS.muted,
                    textTransform: "uppercase",
                  }}
                >
                  Zone:{" "}
                  <span style={{ color: COLORS.black }}>
                    {rentRecalcProgress >= 0.5
                      ? RENT_AFTER.zone
                      : RENT_BEFORE.zone}
                  </span>
                </div>
                {rentRecalcProgress > 0.05 && rentRecalcProgress < 0.95 ? (
                  <div
                    style={{
                      marginTop: 16,
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      color: COLORS.red,
                      textTransform: "uppercase",
                    }}
                  >
                    ↻ Recalculating…
                  </div>
                ) : null}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    marginBottom: 14,
                  }}
                >
                  Rent in {rentAreaLabel}
                </div>
                <RentList
                  options={rentOptions}
                  recalcProgress={rentRecalcProgress}
                />
              </div>
            </div>
          </SectionShell>
        </div>

        {/* Food scene: work-location input + Food card */}
        <div
          style={{ position: "absolute", top: SECTION_Y.food, left: 0, right: 0 }}
        >
          <SectionShell
            stamp="Food Near Work"
            stampBg={COLORS.yellow}
            stampRotate={1.5}
            stampSide="right"
            accentColor={COLORS.yellow}
            height={LAYOUT.FOOD_HEIGHT}
            focusStrength={focus.food}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "380px 1fr",
                gap: 36,
                height: "100%",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                    color: COLORS.muted,
                  }}
                >
                  Work Location
                </div>
                <div
                  style={{
                    border: `3px solid ${COLORS.black}`,
                    backgroundColor: COLORS.white,
                    padding: "14px 18px",
                    fontWeight: 700,
                    fontSize: 22,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span>{workLocationDisplay}</span>
                  {foodEditingCaret ? (
                    <span
                      style={{
                        marginLeft: 2,
                        width: 2,
                        height: 24,
                        backgroundColor: COLORS.black,
                      }}
                    />
                  ) : null}
                </div>
                <div
                  style={{
                    marginTop: 20,
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    color: COLORS.muted,
                    textTransform: "uppercase",
                  }}
                >
                  Zone:{" "}
                  <span style={{ color: COLORS.black }}>
                    {foodRecalcProgress >= 0.5
                      ? FOOD_AFTER.zone
                      : FOOD_BEFORE.zone}
                  </span>
                </div>
                {foodRecalcProgress > 0.05 && foodRecalcProgress < 0.95 ? (
                  <div
                    style={{
                      marginTop: 16,
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      color: COLORS.red,
                      textTransform: "uppercase",
                    }}
                  >
                    ↻ Recalculating…
                  </div>
                ) : null}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    marginBottom: 14,
                  }}
                >
                  Food in {foodAreaLabel}
                </div>
                <FoodList
                  options={foodOptions}
                  recalcProgress={foodRecalcProgress}
                />
              </div>
            </div>
          </SectionShell>
        </div>
      </div>

      {/* ── Calc-button intro overlay ─────────────────────── */}
      {frame < calcFlashEnd + 15 ? (
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.cream,
            opacity: 1 - dashboardEmergeOpacity,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.2em",
              color: COLORS.muted,
              textTransform: "uppercase",
              marginBottom: 28,
            }}
          >
            — Navigating to Dashboard
          </div>
          <div
            style={{
              border: `4px solid ${COLORS.black}`,
              backgroundColor:
                calcButtonHighlight > 0.3 ? COLORS.red : COLORS.red,
              color: COLORS.white,
              padding: "32px 80px",
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontFamily,
              boxShadow: `${interpolate(
                calcButtonPress,
                [0, 1],
                [8, 1],
              )}px ${interpolate(calcButtonPress, [0, 1], [8, 1])}px 0 ${COLORS.black}`,
              transform: `translate(${interpolate(
                calcButtonPress,
                [0, 1],
                [0, 4],
              )}px, ${interpolate(calcButtonPress, [0, 1], [0, 4])}px)`,
              outline:
                calcButtonHighlight > 0.3 && calcButtonPress < 0.2
                  ? `4px solid ${COLORS.yellow}`
                  : "none",
              outlineOffset: 6,
            }}
          >
            Calculate Budget
          </div>
        </AbsoluteFill>
      ) : null}

      {/* White flash overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: COLORS.white,
          opacity: whiteFlash,
          pointerEvents: "none",
        }}
      />

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
          opacity: dashboardEmergeOpacity,
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
              ["cards", "SUMMARY"],
              ["savings", "SAVINGS"],
              ["pie", "BREAKDOWN"],
              ["rent", "RENT"],
              ["food", "FOOD"],
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
