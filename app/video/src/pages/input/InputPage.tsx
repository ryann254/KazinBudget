import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { brutalistCard, COLORS, fontFamily, formatKES } from "../../theme";
import { BrandTitle } from "../../components/BrandTitle";
import {
  countUp,
  easeOutExpo,
  easeOvershoot,
  pulse,
  typed,
} from "../../animations";
import {
  ADDED_GYM_AMOUNT,
  ADD_ROW_CHAR_FRAMES,
  ADD_ROW_EXPAND_AT,
  ADD_ROW_TEXT,
  ADD_ROW_TYPE_AT,
  CAMERA_Y,
  CLICK_MODE_INDEX,
  COMMUTE_AFTER,
  COMMUTE_DISTANCE_UPDATE_AT,
  COMMUTE_MODE_REVEAL_AT,
  EXPERIENCE_TARGET,
  EXPERIENCE_TYPE_OFFSET,
  HOME_ERASE_AT,
  HOME_RETYPE_AT,
  HOME_RETYPE_CHAR_FRAMES,
  HOME_RETYPE_TEXT,
  LAYOUT,
  NET_PULSE_AT,
  PAGE_HEIGHT,
  PERSONAL_FIELDS,
  SALARY_TARGET,
  SALARY_TYPE_DURATION,
  SALARY_TYPE_OFFSET,
  SCENES,
  SECTION_Y,
  SEEDED_EXPENSES,
  TAKEHOME_PULSE_AT,
  TAX_CARD_DURATION,
  TAX_CARD_START,
  TAX_TARGETS,
  TOTAL_COUNT_AT,
  TOTAL_COUNT_DURATION,
  TRANSPORT_CLICK_AMOUNT,
  TRANSPORT_ROW_PULSE_AT,
} from "./timeline";

// ───────────────────────── helpers ─────────────────────────

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

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  marginBottom: 10,
  fontFamily,
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "14px 18px",
  fontSize: 20,
  fontWeight: 600,
  fontFamily,
  border: `3px solid ${COLORS.black}`,
  backgroundColor: COLORS.white,
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  minHeight: 60,
};

type Section = "personal" | "salary" | "commute" | "expenses" | "takehome";

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
  const translateY = interpolate(focusStrength, [0, 1], [0, -4]);
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
        transform: `translateY(${translateY}px)`,
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
          padding: 36,
          paddingTop: 48,
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

type FieldProps = {
  label: string;
  value: string;
  showCaret?: boolean;
};

const Field: React.FC<FieldProps> = ({ label, value, showCaret }) => (
  <div>
    <div style={LABEL_STYLE}>{label}</div>
    <div style={INPUT_STYLE}>
      <span>{value}</span>
      {showCaret ? (
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
  </div>
);

// ── Focus & camera ────────────────────────────────────────
function sectionFocus(frame: number): Record<Section, number> {
  const focusAt = (start: number, duration: number) => {
    const rampIn = 30;
    const rampOut = 30;
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
    personal: focusAt(SCENES.personal.start, SCENES.personal.duration),
    salary: focusAt(SCENES.salary.start, SCENES.salary.duration),
    commute: focusAt(SCENES.commute.start, SCENES.commute.duration),
    expenses: focusAt(SCENES.expenses.start, SCENES.expenses.duration),
    takehome: focusAt(SCENES.takehome.start, SCENES.takehome.duration),
  };
}

function cameraScrollY(frame: number): number {
  const waypoints = [
    { f: 0, y: CAMERA_Y.personal },
    { f: SCENES.title.duration, y: CAMERA_Y.personal },
    { f: SCENES.personal.start + 30, y: CAMERA_Y.personal },
    { f: SCENES.personal.start + SCENES.personal.duration - 30, y: CAMERA_Y.personal },
    { f: SCENES.salary.start + 30, y: CAMERA_Y.salary },
    { f: SCENES.salary.start + SCENES.salary.duration - 30, y: CAMERA_Y.salary },
    { f: SCENES.commute.start + 30, y: CAMERA_Y.commute },
    { f: SCENES.commute.start + SCENES.commute.duration - 30, y: CAMERA_Y.commute },
    { f: SCENES.expenses.start + 30, y: CAMERA_Y.expenses },
    { f: SCENES.expenses.start + SCENES.expenses.duration - 30, y: CAMERA_Y.expenses },
    { f: SCENES.takehome.start + 30, y: CAMERA_Y.takehome },
    { f: SCENES.takehome.start + SCENES.takehome.duration, y: CAMERA_Y.takehome },
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

// ───────────────────────── Component ───────────────────────

export const InputPage: React.FC = () => {
  const frame = useCurrentFrame();
  const focus = sectionFocus(frame);
  const scrollY = cameraScrollY(frame);

  // Title overlay
  const titleIn = interpolate(frame, [0, 60], [0, 1], {
    easing: easeOutExpo,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOut = interpolate(
    frame,
    [SCENES.title.duration - 20, SCENES.title.duration + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const titleOpacity = titleIn - titleOut;
  const pageOpacity = interpolate(
    frame,
    [SCENES.title.duration - 30, SCENES.title.duration + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Personal info
  const personalStart = SCENES.personal.start;
  const personalValues: Record<string, string> = {};
  for (const f of PERSONAL_FIELDS) {
    personalValues[f.key] = typed(
      frame,
      personalStart + f.offset,
      f.text,
      f.charFrames,
    );
  }
  const activeField = PERSONAL_FIELDS.find((f) => {
    const absStart = personalStart + f.offset;
    const absEnd = absStart + f.text.length * f.charFrames;
    return frame >= absStart && frame <= absEnd + 6;
  })?.key;

  // Salary
  const salaryStart = SCENES.salary.start;
  const salaryTypeStart = salaryStart + SALARY_TYPE_OFFSET;
  const salaryTyping =
    frame >= salaryTypeStart && frame <= salaryTypeStart + SALARY_TYPE_DURATION;
  const salaryValue = Math.round(
    interpolate(
      frame,
      [salaryTypeStart, salaryTypeStart + SALARY_TYPE_DURATION],
      [0, SALARY_TARGET],
      {
        easing: easeOutExpo,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    ),
  );
  const experienceValue = Math.round(
    interpolate(
      frame,
      [salaryStart + EXPERIENCE_TYPE_OFFSET, salaryStart + EXPERIENCE_TYPE_OFFSET + 25],
      [0, EXPERIENCE_TARGET],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    ),
  );
  const taxStart = salaryStart + TAX_CARD_START;
  const taxCardProgress = (i: number) =>
    interpolate(frame, [taxStart + i * 10, taxStart + i * 10 + 30], [0, 1], {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const paye = countUp(frame, taxStart + 30, TAX_CARD_DURATION, TAX_TARGETS.paye);
  const nssf = countUp(frame, taxStart + 40, TAX_CARD_DURATION, TAX_TARGETS.nssf);
  const shif = countUp(frame, taxStart + 50, TAX_CARD_DURATION, TAX_TARGETS.shif);
  const housing = countUp(
    frame,
    taxStart + 60,
    TAX_CARD_DURATION,
    TAX_TARGETS.housing,
  );
  const netSalary = countUp(
    frame,
    salaryStart + NET_PULSE_AT - 30,
    40,
    TAX_TARGETS.netSalary,
  );
  const netScale = pulse(frame, salaryStart + NET_PULSE_AT, 24);

  // Commute
  const commuteStart = SCENES.commute.start;
  const initialHomeArea =
    PERSONAL_FIELDS.find((f) => f.key === "homeArea")?.text ?? "";
  const eraseStart = commuteStart + HOME_ERASE_AT;
  const eraseDuration = 30;
  const retypeStart = commuteStart + HOME_RETYPE_AT;
  const retypeDuration = HOME_RETYPE_TEXT.length * HOME_RETYPE_CHAR_FRAMES;

  let homeAreaDisplay: string;
  if (frame < commuteStart) {
    homeAreaDisplay = personalValues.homeArea;
  } else if (frame < eraseStart) {
    homeAreaDisplay = initialHomeArea;
  } else if (frame < retypeStart) {
    const erased = Math.min(
      initialHomeArea.length,
      Math.floor(((frame - eraseStart) / eraseDuration) * initialHomeArea.length),
    );
    homeAreaDisplay = initialHomeArea.slice(0, initialHomeArea.length - erased);
  } else {
    homeAreaDisplay = typed(
      frame,
      retypeStart,
      HOME_RETYPE_TEXT,
      HOME_RETYPE_CHAR_FRAMES,
    );
  }
  const homeIsActive =
    activeField === "homeArea" ||
    (frame >= eraseStart && frame <= retypeStart + retypeDuration + 6);
  const workLocationRaw = personalValues.workLocation;
  const commuteDestination = workLocationRaw
    ? workLocationRaw.split(",")[0].trim() || "—"
    : "—";

  const distanceProgress = interpolate(
    frame,
    [
      commuteStart + COMMUTE_DISTANCE_UPDATE_AT,
      commuteStart + COMMUTE_DISTANCE_UPDATE_AT + 40,
    ],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const distanceKm = Math.round(distanceProgress * COMMUTE_AFTER.distanceKm);
  const modeRevealAt = commuteStart + COMMUTE_MODE_REVEAL_AT;
  const modeReveal = (i: number) =>
    interpolate(
      frame,
      [modeRevealAt + i * 8, modeRevealAt + i * 8 + 30],
      [0, 1],
      {
        easing: easeOvershoot,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );

  // Matatu click (late in commute scene)
  const clickBase = commuteStart + SCENES.commute.duration - 90;
  const clickHighlight = interpolate(
    frame,
    [clickBase, clickBase + 18],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const clickPress = interpolate(
    frame,
    [clickBase + 25, clickBase + 30, clickBase + 42],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const clickFadeOut = interpolate(
    frame,
    [clickBase + 42, clickBase + 72],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const clickHighlightFinal = clickHighlight * clickFadeOut;
  const clickAt = clickBase + 30;

  const transportRowVisible = frame >= clickAt;
  const rowSlideProgress = interpolate(
    frame,
    [clickAt, clickAt + 30],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const rowAmountProgress = interpolate(
    frame,
    [clickAt, clickAt + 40],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const transportRowAmount = Math.round(
    rowAmountProgress * TRANSPORT_CLICK_AMOUNT,
  );

  // Expenses — highlight the newly-added transport row then open Add-item
  const expensesStart = SCENES.expenses.start;
  const transportPulseAt = expensesStart + TRANSPORT_ROW_PULSE_AT;
  const transportRowPulseScale = pulse(frame, transportPulseAt, 28);
  const transportHighlightGlow = interpolate(
    frame,
    [expensesStart + 30, expensesStart + 60, transportPulseAt + 40],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const addExpandAt = expensesStart + ADD_ROW_EXPAND_AT;
  const addTypeAt = expensesStart + ADD_ROW_TYPE_AT;
  const addRowOpen = frame >= addExpandAt;
  const addRowExpandProgress = interpolate(
    frame,
    [addExpandAt, addExpandAt + 18],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const addNameTyped = typed(frame, addTypeAt, ADD_ROW_TEXT, ADD_ROW_CHAR_FRAMES);
  const addAmountTypedProgress = interpolate(
    frame,
    [addTypeAt + 20, addTypeAt + 60],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const addAmountTyped =
    frame >= addTypeAt + 20 && addAmountTypedProgress > 0
      ? Math.round(addAmountTypedProgress * ADDED_GYM_AMOUNT).toString()
      : "";
  const addCommitAt = addTypeAt + 70;
  const gymRowVisible = frame >= addCommitAt;
  const gymSlideProgress = interpolate(
    frame,
    [addCommitAt, addCommitAt + 30],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Totals
  const baseSeededTotal = SEEDED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  let displayedTotal = baseSeededTotal;
  if (transportRowVisible) displayedTotal += transportRowAmount;
  if (gymRowVisible) displayedTotal += Math.round(gymSlideProgress * ADDED_GYM_AMOUNT);
  const finalTotal = baseSeededTotal + TRANSPORT_CLICK_AMOUNT + ADDED_GYM_AMOUNT;
  const takehomeStart = SCENES.takehome.start;
  const totalCountProgress = interpolate(
    frame,
    [
      takehomeStart + TOTAL_COUNT_AT,
      takehomeStart + TOTAL_COUNT_AT + TOTAL_COUNT_DURATION,
    ],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const animatedTotal =
    frame >= takehomeStart
      ? Math.round(displayedTotal + (finalTotal - displayedTotal) * totalCountProgress)
      : displayedTotal;
  const takeHomeValue = Math.max(0, TAX_TARGETS.netSalary - animatedTotal);
  const takehomeScale = pulse(frame, takehomeStart + TAKEHOME_PULSE_AT, 32);

  // Camera transform
  const cameraTranslate = -scrollY;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cream, fontFamily, overflow: "hidden" }}>
      <div
        style={{
          width: LAYOUT.PAGE_WIDTH,
          height: PAGE_HEIGHT,
          opacity: pageOpacity,
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
              {(personalValues.fullName || "—").toUpperCase()} —{" "}
              {(personalValues.jobTitle || "—").toUpperCase()}
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div style={{ position: "absolute", top: SECTION_Y.personal, left: 0, right: 0 }}>
          <SectionShell
            stamp="Personal Info"
            stampBg={COLORS.yellow}
            stampRotate={-2}
            stampSide="left"
            accentColor={COLORS.blue}
            height={LAYOUT.PERSONAL_HEIGHT}
            focusStrength={focus.personal}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 28,
                rowGap: 32,
              }}
            >
              {PERSONAL_FIELDS.map((f) => (
                <Field
                  key={f.key}
                  label={f.label}
                  value={
                    f.key === "homeArea" ? homeAreaDisplay : personalValues[f.key]
                  }
                  showCaret={
                    f.key === "homeArea" ? homeIsActive : activeField === f.key
                  }
                />
              ))}
            </div>
          </SectionShell>
        </div>

        {/* Salary & Tax */}
        <div style={{ position: "absolute", top: SECTION_Y.salary, left: 0, right: 0 }}>
          <SectionShell
            stamp="Salary & Tax"
            stampBg={COLORS.red}
            stampColor={COLORS.white}
            stampRotate={1.5}
            stampSide="right"
            accentColor={COLORS.red}
            height={LAYOUT.SALARY_HEIGHT}
            focusStrength={focus.salary}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 28,
                marginBottom: 36,
              }}
            >
              <Field
                label="GROSS SALARY (KES)"
                value={salaryValue > 0 ? salaryValue.toLocaleString("en-KE") : ""}
                showCaret={salaryTyping}
              />
              <Field
                label="EXPERIENCE (YEARS)"
                value={experienceValue > 0 ? String(experienceValue) : ""}
                showCaret={false}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
                marginBottom: 28,
              }}
            >
              {[
                { label: "PAYE", bg: COLORS.yellow, color: COLORS.black, value: paye, i: 0 },
                { label: "NSSF", bg: COLORS.blue, color: COLORS.white, value: nssf, i: 1 },
                { label: "SHIF", bg: COLORS.teal, color: COLORS.white, value: shif, i: 2 },
                { label: "HOUSING", bg: COLORS.muted, color: COLORS.white, value: housing, i: 3 },
              ].map((t) => {
                const visible = taxCardProgress(t.i);
                return (
                  <div
                    key={t.label}
                    style={{
                      border: `2px solid ${COLORS.black}`,
                      backgroundColor: t.bg,
                      color: t.color,
                      padding: 18,
                      textAlign: "center",
                      opacity: visible,
                      transform: `translateY(${interpolate(visible, [0, 1], [14, 0])}px)`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                      }}
                    >
                      {t.label}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>
                      {formatKES(t.value)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                border: `3px solid ${COLORS.black}`,
                backgroundColor: COLORS.black,
                color: COLORS.yellow,
                padding: 20,
                textAlign: "center",
                fontSize: 26,
                fontWeight: 900,
                transform: `scale(${netScale})`,
              }}
            >
              NET AFTER TAX: {formatKES(netSalary)}
            </div>
          </SectionShell>
        </div>

        {/* Commute */}
        <div style={{ position: "absolute", top: SECTION_Y.commute, left: 0, right: 0 }}>
          <SectionShell
            stamp="Commute"
            stampBg={COLORS.blue}
            stampColor={COLORS.white}
            stampRotate={-1}
            stampSide="left"
            accentColor={COLORS.yellow}
            height={LAYOUT.COMMUTE_HEIGHT}
            focusStrength={focus.commute}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: 32,
                fontWeight: 700,
                fontSize: 24,
              }}
            >
              <span>{homeAreaDisplay || "—"}</span>
              <span style={{ color: COLORS.red, fontSize: 32, fontWeight: 900 }}>
                →
              </span>
              <span>{commuteDestination}</span>
              <span
                style={{
                  marginLeft: "auto",
                  border: `2px solid ${COLORS.black}`,
                  backgroundColor: COLORS.yellow,
                  padding: "6px 16px",
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                }}
              >
                {distanceKm} KM
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 18,
              }}
            >
              {COMMUTE_AFTER.modes.map((mode, i) => {
                const accents = [COLORS.red, COLORS.blue, COLORS.yellow, COLORS.teal];
                const accent = accents[i % accents.length];
                const reveal = modeReveal(i);
                const isTarget = i === CLICK_MODE_INDEX;
                const highlight = isTarget ? clickHighlightFinal : 0;
                const press = isTarget ? clickPress : 0;
                return (
                  <div
                    key={mode.mode}
                    style={{
                      border: `3px solid ${COLORS.black}`,
                      borderTop: `5px solid ${accent}`,
                      backgroundColor: COLORS.white,
                      padding: 20,
                      boxShadow: `4px 4px 0 ${COLORS.black}`,
                      transform: `translate(${interpolate(
                        press,
                        [0, 1],
                        [0, 3],
                      )}px, ${interpolate(reveal, [0, 1], [16, 0]) + interpolate(
                        press,
                        [0, 1],
                        [0, 3],
                      )}px) scale(${interpolate(highlight, [0, 1], [1, 1.05])})`,
                      opacity: reveal,
                      outline:
                        highlight > 0.1 ? `4px solid ${COLORS.yellow}` : "none",
                      outlineOffset: 3,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                      }}
                    >
                      {mode.mode}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 10 }}>
                      {formatKES(mode.monthly)}
                      <span
                        style={{
                          color: COLORS.muted,
                          marginLeft: 4,
                          fontWeight: 600,
                          fontSize: 16,
                        }}
                      >
                        /mo
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {frame >= clickAt && focus.commute > 0.4 ? (
              <div
                style={{
                  marginTop: 24,
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  color: COLORS.muted,
                  textTransform: "uppercase",
                  opacity: interpolate(frame, [clickAt, clickAt + 20], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                → Added to Monthly Expenses
              </div>
            ) : null}
          </SectionShell>
        </div>

        {/* Monthly Expenses */}
        <div style={{ position: "absolute", top: SECTION_Y.expenses, left: 0, right: 0 }}>
          <SectionShell
            stamp="Monthly Expenses"
            stampBg={COLORS.teal}
            stampColor={COLORS.white}
            stampRotate={2}
            stampSide="right"
            accentColor={COLORS.teal}
            height={LAYOUT.EXPENSES_HEIGHT}
            focusStrength={focus.expenses}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              {SEEDED_EXPENSES.map((e) => {
                const accents: Record<string, string> = {
                  red: COLORS.red,
                  blue: COLORS.blue,
                  yellow: COLORS.yellow,
                  teal: COLORS.teal,
                  muted: COLORS.muted,
                };
                return (
                  <div
                    key={e.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 20px",
                      borderLeft: `3px solid ${accents[e.accent]}`,
                      borderBottom: `2px solid ${COLORS.black}`,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: 15,
                        letterSpacing: "0.05em",
                      }}
                    >
                      — {e.name}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: 18 }}>
                      {formatKES(e.amount)}
                    </span>
                  </div>
                );
              })}

              {transportRowVisible ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 20px",
                    borderLeft: `3px solid ${COLORS.yellow}`,
                    borderBottom: `2px solid ${COLORS.black}`,
                    backgroundColor:
                      transportHighlightGlow > 0.05
                        ? `rgba(244, 211, 94, ${transportHighlightGlow * 0.35})`
                        : COLORS.white,
                    transform: `translateX(${interpolate(
                      rowSlideProgress,
                      [0, 1],
                      [-60, 0],
                    )}px) scale(${transportRowPulseScale})`,
                    opacity: rowSlideProgress,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 15,
                      letterSpacing: "0.05em",
                    }}
                  >
                    — TRANSPORT ({COMMUTE_AFTER.modes[CLICK_MODE_INDEX].mode})
                  </span>
                  <span style={{ fontWeight: 800, fontSize: 18 }}>
                    {formatKES(transportRowAmount)}
                  </span>
                </div>
              ) : null}

              {gymRowVisible ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 20px",
                    borderLeft: `3px solid ${COLORS.muted}`,
                    borderBottom: `2px solid ${COLORS.black}`,
                    transform: `translateX(${interpolate(
                      gymSlideProgress,
                      [0, 1],
                      [-60, 0],
                    )}px)`,
                    opacity: gymSlideProgress,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 15,
                      letterSpacing: "0.05em",
                    }}
                  >
                    — {ADD_ROW_TEXT.toUpperCase()}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: 18 }}>
                    {formatKES(Math.round(gymSlideProgress * ADDED_GYM_AMOUNT))}
                  </span>
                </div>
              ) : null}

              {addRowOpen && frame < addCommitAt ? (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "12px 20px",
                    borderLeft: `3px solid ${COLORS.muted}`,
                    borderBottom: `2px solid ${COLORS.black}`,
                    backgroundColor: COLORS.yellow,
                    opacity: addRowExpandProgress,
                    transform: `scaleY(${addRowExpandProgress})`,
                    transformOrigin: "top",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: `2px solid ${COLORS.black}`,
                      backgroundColor: COLORS.white,
                      fontWeight: 800,
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {addNameTyped}
                    {frame >= addTypeAt && frame < addTypeAt + 20 ? (
                      <span
                        style={{
                          marginLeft: 2,
                          width: 2,
                          height: 16,
                          backgroundColor: COLORS.black,
                        }}
                      />
                    ) : null}
                  </div>
                  <div
                    style={{
                      width: 160,
                      padding: "8px 12px",
                      border: `2px solid ${COLORS.black}`,
                      backgroundColor: COLORS.white,
                      fontWeight: 800,
                      fontSize: 14,
                      textAlign: "right",
                    }}
                  >
                    {addAmountTyped}
                  </div>
                  <div
                    style={{
                      padding: "8px 14px",
                      border: `2px solid ${COLORS.black}`,
                      backgroundColor: COLORS.white,
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    ✓
                  </div>
                  <div
                    style={{
                      padding: "8px 14px",
                      border: `2px solid ${COLORS.black}`,
                      backgroundColor: COLORS.white,
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    ✕
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 20px",
                    borderLeft: `3px solid ${COLORS.muted}`,
                    borderBottom: `2px solid ${COLORS.black}`,
                    color: COLORS.muted,
                    fontWeight: 800,
                    fontSize: 14,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    opacity: focus.expenses > 0.4 && frame < addExpandAt ? 1 : 0.45,
                  }}
                >
                  + Add item
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: 20,
                border: `3px solid ${COLORS.black}`,
                backgroundColor: COLORS.black,
                color: COLORS.yellow,
                padding: 14,
                textAlign: "center",
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              TOTAL EXPENSES: {formatKES(animatedTotal)}
            </div>
          </SectionShell>
        </div>

        {/* Take-Home */}
        <div style={{ position: "absolute", top: SECTION_Y.takehome, left: 0, right: 0 }}>
          <div
            style={{
              width: LAYOUT.CONTENT_WIDTH,
              margin: "0 auto",
              height: LAYOUT.TAKEHOME_HEIGHT,
              opacity: interpolate(focus.takehome, [0, 1], [0.4, 1]),
              filter: `blur(${interpolate(focus.takehome, [0, 1], [2, 0])}px)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                backgroundColor: COLORS.teal,
                border: `3px solid ${COLORS.black}`,
                boxShadow: `10px 10px 0 ${COLORS.black}`,
                padding: "40px 60px",
                textAlign: "center",
                color: COLORS.white,
                transform: `scale(${takehomeScale}) rotate(-0.5deg)`,
                width: "100%",
                maxWidth: 1200,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  opacity: 0.9,
                }}
              >
                Monthly Take-Home
              </div>
              <div style={{ fontSize: 72, fontWeight: 900, marginTop: 10 }}>
                {formatKES(takeHomeValue)}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 28,
                  fontSize: 16,
                  marginTop: 18,
                  fontWeight: 700,
                  opacity: 0.9,
                }}
              >
                <span>Gross: {formatKES(SALARY_TARGET)}</span>
                <span style={{ opacity: 0.5 }}>|</span>
                <span>
                  Deductions:{" "}
                  {formatKES(
                    TAX_TARGETS.paye +
                      TAX_TARGETS.nssf +
                      TAX_TARGETS.shif +
                      TAX_TARGETS.housing,
                  )}
                </span>
                <span style={{ opacity: 0.5 }}>|</span>
                <span>Expenses: {formatKES(animatedTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title overlay */}
      {titleOpacity > 0.01 ? (
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.black,
            opacity: titleOpacity,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <BrandTitle
            frame={frame}
            tagline="Prepare for your new job with the right tools"
          />
        </AbsoluteFill>
      ) : null}

      {/* Section tracker */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          opacity: pageOpacity,
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
              ["personal", "PERSONAL"],
              ["salary", "SALARY"],
              ["commute", "COMMUTE"],
              ["expenses", "EXPENSES"],
              ["takehome", "TAKE-HOME"],
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
