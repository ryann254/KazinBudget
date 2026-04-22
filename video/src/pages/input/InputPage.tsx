import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  brutalistCard,
  COLORS,
  fontFamily,
  formatKES,
} from "../../theme";
import {
  countUp,
  easeOutExpo,
  easeOvershoot,
  fadeInUp,
  pulse,
  typed,
} from "../../animations";
import {
  CLICK_AT,
  CLICK_HIGHLIGHT_AT,
  COMMUTE_AFTER,
  COMMUTE_DISTANCE_UPDATE_AT,
  COMMUTE_MODE_REVEAL_AT,
  EXPERIENCE_TARGET,
  EXPERIENCE_TYPE_OFFSET,
  HOME_ERASE_AT,
  HOME_RETYPE_AT,
  HOME_RETYPE_CHAR_FRAMES,
  HOME_RETYPE_TEXT,
  NET_PULSE_AT,
  PERSONAL_FIELDS,
  ROW_SLIDE_DURATION,
  ROW_SLIDE_IN_AT,
  SALARY_TARGET,
  SALARY_TYPE_DURATION,
  SALARY_TYPE_OFFSET,
  SCENES,
  SEEDED_EXPENSES,
  TAKEHOME_PULSE_AT,
  TAX_CARD_DURATION,
  TAX_CARD_START,
  TAX_TARGETS,
  TOTAL_COUNT_AT,
  TOTAL_COUNT_DURATION,
  TRANSPORT_CLICK_AMOUNT,
  CLICK_MODE_INDEX,
} from "./timeline";

const STAMP_STYLE: React.CSSProperties = {
  position: "absolute",
  top: -14,
  padding: "4px 12px",
  fontWeight: 800,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  border: `2px solid ${COLORS.black}`,
  fontFamily,
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  marginBottom: 8,
  fontFamily,
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  fontSize: 16,
  fontWeight: 600,
  fontFamily,
  border: `3px solid ${COLORS.black}`,
  backgroundColor: COLORS.white,
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  minHeight: 48,
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
            height: 20,
            backgroundColor: COLORS.black,
          }}
        />
      ) : null}
    </div>
  </div>
);

const TaxCard: React.FC<{
  label: string;
  bg: string;
  color: string;
  value: number;
  visible: number;
}> = ({ label, bg, color, value, visible }) => (
  <div
    style={{
      border: `2px solid ${COLORS.black}`,
      backgroundColor: bg,
      color,
      padding: 14,
      textAlign: "center",
      opacity: visible,
      transform: `translateY(${interpolate(visible, [0, 1], [10, 0])}px)`,
      fontFamily,
    }}
  >
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
      {formatKES(value)}
    </div>
  </div>
);

const ModeCard: React.FC<{
  label: string;
  monthly: number;
  accentColor: string;
  highlight: number;
  revealProgress: number;
  pressProgress: number;
}> = ({ label, monthly, accentColor, highlight, revealProgress, pressProgress }) => (
  <div
    style={{
      border: `3px solid ${COLORS.black}`,
      borderTop: `4px solid ${accentColor}`,
      backgroundColor: COLORS.white,
      padding: 14,
      fontFamily,
      boxShadow: `4px 4px 0 ${COLORS.black}`,
      transform: `translate(${interpolate(
        pressProgress,
        [0, 1],
        [0, 3],
      )}px, ${interpolate(revealProgress, [0, 1], [12, 0]) + interpolate(
        pressProgress,
        [0, 1],
        [0, 3],
      )}px) scale(${interpolate(highlight, [0, 1], [1, 1.05])})`,
      opacity: revealProgress,
      outline:
        highlight > 0.1
          ? `3px solid ${COLORS.yellow}`
          : "none",
      outlineOffset: 2,
    }}
  >
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: 16, fontWeight: 700, marginTop: 8 }}>
      {formatKES(monthly)}
      <span style={{ color: COLORS.muted, marginLeft: 4, fontWeight: 600 }}>
        /mo
      </span>
    </div>
  </div>
);

export const InputPage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── Title overlay ────────────────────────────────────
  const titleIn = interpolate(
    frame,
    [0, SCENES.title.duration - 30],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const titleOut = interpolate(
    frame,
    [SCENES.title.duration - 20, SCENES.title.duration + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const titleOpacity = titleIn - titleOut;

  // ─── Personal Info values ─────────────────────────────
  const personalStart = SCENES.personal.start;
  const personalValues: Record<string, string> = {};
  const activeField = PERSONAL_FIELDS.find((f) => {
    const absStart = personalStart + f.offset;
    const absEnd = absStart + f.text.length * f.charFrames;
    return frame >= absStart && frame <= absEnd + 6;
  })?.key;

  for (const f of PERSONAL_FIELDS) {
    personalValues[f.key] = typed(
      frame,
      personalStart + f.offset,
      f.text,
      f.charFrames,
    );
  }

  // ─── Salary & Tax values ──────────────────────────────
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
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    ),
  );

  // Tax card visibility / counts
  const taxStart = salaryStart + TAX_CARD_START;
  const taxCardProgress = (idx: number) =>
    interpolate(
      frame,
      [taxStart + idx * 10, taxStart + idx * 10 + 30],
      [0, 1],
      {
        easing: easeOutExpo,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  const paye = countUp(
    frame,
    taxStart + 30,
    TAX_CARD_DURATION,
    TAX_TARGETS.paye,
  );
  const nssf = countUp(
    frame,
    taxStart + 40,
    TAX_CARD_DURATION,
    TAX_TARGETS.nssf,
  );
  const shif = countUp(
    frame,
    taxStart + 50,
    TAX_CARD_DURATION,
    TAX_TARGETS.shif,
  );
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

  // ─── Commute: home-area edit ──────────────────────────
  const commuteStart = SCENES.commute.start;
  const initialHomeArea = PERSONAL_FIELDS.find((f) => f.key === "homeArea")
    ?.text ?? "";
  const eraseStart = commuteStart + HOME_ERASE_AT;
  const eraseDuration = 30;
  const retypeStart = commuteStart + HOME_RETYPE_AT;
  const retypeDuration = HOME_RETYPE_TEXT.length * HOME_RETYPE_CHAR_FRAMES;

  // Before commute scene, use the value progressively typed in Personal Info.
  // During commute scene, erase then retype.
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
    (activeField === "homeArea") ||
    (frame >= eraseStart && frame <= retypeStart + retypeDuration + 6);

  // Destination name for the commute line follows Work Location input.
  const workLocationRaw = personalValues.workLocation;
  const commuteDestination = workLocationRaw
    ? workLocationRaw.split(",")[0].trim() || "—"
    : "—";

  // Commute distance + modes
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
    interpolate(frame, [modeRevealAt + i * 8, modeRevealAt + i * 8 + 30], [0, 1], {
      easing: easeOvershoot,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // ─── Click: highlight + press on the chosen mode card ────────────
  const clickStart = SCENES.click.start;
  const clickHighlight = interpolate(
    frame,
    [clickStart + CLICK_HIGHLIGHT_AT, clickStart + CLICK_HIGHLIGHT_AT + 18],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const clickPress = interpolate(
    frame,
    [clickStart + CLICK_AT - 4, clickStart + CLICK_AT, clickStart + CLICK_AT + 8],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const clickHighlightOut = interpolate(
    frame,
    [clickStart + CLICK_AT + 10, clickStart + CLICK_AT + 30],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const clickHighlightFinal = clickHighlight * clickHighlightOut;

  // ─── Transport row slide-in ───────────────────────────
  const rowSlideProgress = interpolate(
    frame,
    [clickStart + ROW_SLIDE_IN_AT, clickStart + ROW_SLIDE_IN_AT + ROW_SLIDE_DURATION],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const transportRowVisible = frame >= clickStart + ROW_SLIDE_IN_AT;

  // ─── Totals at takehome scene ─────────────────────────
  const takehomeStart = SCENES.takehome.start;
  const baseSeededTotal = SEEDED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const transportRowAmountProgress = interpolate(
    frame,
    [clickStart + ROW_SLIDE_IN_AT, clickStart + ROW_SLIDE_IN_AT + 45],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const transportRowAmount = Math.round(
    transportRowAmountProgress * TRANSPORT_CLICK_AMOUNT,
  );
  const displayedTotal = transportRowVisible
    ? baseSeededTotal + transportRowAmount
    : baseSeededTotal;
  const finalTotal = baseSeededTotal + TRANSPORT_CLICK_AMOUNT;
  const totalCountProgress = interpolate(
    frame,
    [takehomeStart + TOTAL_COUNT_AT, takehomeStart + TOTAL_COUNT_AT + TOTAL_COUNT_DURATION],
    [0, 1],
    {
      easing: easeOutExpo,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const animatedTotal =
    frame >= takehomeStart
      ? Math.round(
          displayedTotal +
            (finalTotal - displayedTotal) * totalCountProgress,
        )
      : displayedTotal;
  const takeHomeFinalValue = TAX_TARGETS.netSalary - animatedTotal;
  const takehomeScale = pulse(frame, takehomeStart + TAKEHOME_PULSE_AT, 32);

  // ─── Page enter animation (after title) ───────────────
  const pageOpacity = interpolate(
    frame,
    [SCENES.title.duration - 30, SCENES.title.duration + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ─── Highlight glow around currently-active section ───
  const activeSection: "personal" | "salary" | "commute" | "expenses" | null =
    frame < SCENES.personal.start
      ? null
      : frame < SCENES.salary.start
        ? "personal"
        : frame < SCENES.commute.start
          ? "salary"
          : frame < SCENES.click.start + ROW_SLIDE_IN_AT
            ? "commute"
            : "expenses";

  const glow = (section: string): React.CSSProperties =>
    activeSection === section
      ? {
          boxShadow: `6px 6px 0 ${COLORS.black}, 0 0 0 4px ${COLORS.yellow}66`,
        }
      : {};

  void fps;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.cream,
        fontFamily,
      }}
    >
      {/* ──────────────── Page shell ──────────────── */}
      <div
        style={{
          opacity: pageOpacity,
          padding: "32px 56px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <header
          style={{
            backgroundColor: COLORS.black,
            borderBottom: `4px solid ${COLORS.red}`,
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.white }}>
            KAZI<span style={{ color: COLORS.red }}>&amp;BUDGET</span>
          </div>
          <div
            style={{
              border: `2px solid ${COLORS.yellow}`,
              color: COLORS.yellow,
              padding: "6px 12px",
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
        </header>

        {/* ───────── Row 1: Personal + Salary&Tax ───────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          {/* Personal Info */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                ...STAMP_STYLE,
                left: -8,
                backgroundColor: COLORS.yellow,
                transform: "rotate(-2deg)",
              }}
            >
              Personal Info
            </div>
            <div
              style={{
                ...brutalistCard,
                borderLeft: `6px solid ${COLORS.blue}`,
                padding: 32,
                paddingTop: 36,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                ...glow("personal"),
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
                    f.key === "homeArea"
                      ? homeIsActive
                      : activeField === f.key
                  }
                />
              ))}
            </div>
          </div>

          {/* Salary & Tax */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                ...STAMP_STYLE,
                right: -8,
                backgroundColor: COLORS.red,
                color: COLORS.white,
                transform: "rotate(1.5deg)",
              }}
            >
              Salary &amp; Tax
            </div>
            <div
              style={{
                ...brutalistCard,
                borderLeft: `6px solid ${COLORS.red}`,
                padding: 32,
                paddingTop: 36,
                display: "flex",
                flexDirection: "column",
                gap: 20,
                ...glow("salary"),
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
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

              {/* Tax cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 12,
                }}
              >
                <TaxCard
                  label="PAYE"
                  bg={COLORS.yellow}
                  color={COLORS.black}
                  value={paye}
                  visible={taxCardProgress(0)}
                />
                <TaxCard
                  label="NSSF"
                  bg={COLORS.blue}
                  color={COLORS.white}
                  value={nssf}
                  visible={taxCardProgress(1)}
                />
                <TaxCard
                  label="SHIF"
                  bg={COLORS.teal}
                  color={COLORS.white}
                  value={shif}
                  visible={taxCardProgress(2)}
                />
                <TaxCard
                  label="HOUSING"
                  bg={COLORS.muted}
                  color={COLORS.white}
                  value={housing}
                  visible={taxCardProgress(3)}
                />
              </div>

              {/* Net banner */}
              <div
                style={{
                  border: `3px solid ${COLORS.black}`,
                  backgroundColor: COLORS.black,
                  color: COLORS.yellow,
                  padding: 16,
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: 900,
                  fontFamily,
                  transform: `scale(${netScale})`,
                }}
              >
                NET AFTER TAX: {formatKES(netSalary)}
              </div>
            </div>
          </div>
        </div>

        {/* ───────── Row 2: Commute + Expenses ───────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              ...STAMP_STYLE,
              left: -8,
              backgroundColor: COLORS.blue,
              color: COLORS.white,
              transform: "rotate(-1deg)",
            }}
          >
            Commute
          </div>
          <div
            style={{
              ...brutalistCard,
              borderLeft: `6px solid ${COLORS.yellow}`,
              padding: 22,
              paddingTop: 28,
              ...glow("commute"),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              <span>{homeAreaDisplay || "—"}</span>
              <span style={{ color: COLORS.red, fontSize: 24, fontWeight: 900 }}>
                →
              </span>
              <span>{commuteDestination}</span>
              <span
                style={{
                  marginLeft: "auto",
                  border: `2px solid ${COLORS.black}`,
                  backgroundColor: COLORS.yellow,
                  padding: "4px 12px",
                  fontSize: 12,
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
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
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
                  <ModeCard
                    key={mode.mode}
                    label={mode.mode}
                    monthly={mode.monthly}
                    accentColor={accent}
                    highlight={highlight}
                    revealProgress={reveal}
                    pressProgress={press}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly Expenses (second column of Row 2) */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              ...STAMP_STYLE,
              right: -8,
              backgroundColor: COLORS.teal,
              color: COLORS.white,
              transform: "rotate(2deg)",
            }}
          >
            Monthly Expenses
          </div>
          <div
            style={{
              ...brutalistCard,
              borderLeft: `6px solid ${COLORS.teal}`,
              padding: 22,
              paddingTop: 28,
              ...glow("expenses"),
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              {SEEDED_EXPENSES.map((e, i) => {
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
                      padding: "8px 16px",
                      borderLeft: `3px solid ${accents[e.accent]}`,
                      borderBottom: `2px solid ${COLORS.black}`,
                      ...fadeInUp(frame, 30 + i * 4, 20),
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: 13,
                        letterSpacing: "0.05em",
                      }}
                    >
                      — {e.name}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: 15 }}>
                      {formatKES(e.amount)}
                    </span>
                  </div>
                );
              })}

              {/* Transport row slides in on click */}
              {transportRowVisible ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 20px",
                    borderLeft: `3px solid ${COLORS.yellow}`,
                    borderBottom: `2px solid ${COLORS.black}`,
                    backgroundColor: interpolate(
                      rowSlideProgress,
                      [0, 1],
                      [1, 0],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      },
                    ) > 0.3
                      ? `${COLORS.yellow}33`
                      : COLORS.white,
                    transform: `translateX(${interpolate(
                      rowSlideProgress,
                      [0, 1],
                      [-80, 0],
                    )}px)`,
                    opacity: rowSlideProgress,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 13,
                      letterSpacing: "0.05em",
                    }}
                  >
                    — TRANSPORT ({COMMUTE_AFTER.modes[CLICK_MODE_INDEX].mode})
                  </span>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>
                    {formatKES(transportRowAmount)}
                  </span>
                </div>
              ) : null}
            </div>

            <div
              style={{
                marginTop: 12,
                border: `3px solid ${COLORS.black}`,
                backgroundColor: COLORS.black,
                color: COLORS.yellow,
                padding: 10,
                textAlign: "center",
                fontSize: 15,
                fontWeight: 900,
              }}
            >
              TOTAL EXPENSES: {formatKES(animatedTotal)}
            </div>
          </div>
        </div>
        </div>

        {/* ─────────────── Take-home reveal ─────────────── */}
        <div
          style={{
            backgroundColor: COLORS.teal,
            border: `3px solid ${COLORS.black}`,
            boxShadow: `6px 6px 0 ${COLORS.black}`,
            padding: "20px 40px",
            textAlign: "center",
            color: COLORS.white,
            transform: `scale(${takehomeScale}) rotate(-0.5deg)`,
            opacity: interpolate(
              frame,
              [takehomeStart - 20, takehomeStart + 10],
              [0.7, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            Monthly Take-Home
          </div>
          <div style={{ fontSize: 40, fontWeight: 900, marginTop: 4 }}>
            {formatKES(frame >= takehomeStart ? takeHomeFinalValue : Math.max(0, TAX_TARGETS.netSalary - animatedTotal))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
              fontSize: 14,
              marginTop: 12,
              fontWeight: 700,
              opacity: 0.85,
            }}
          >
            <span>Gross: {formatKES(SALARY_TARGET)}</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>Deductions: {formatKES(TAX_TARGETS.paye + TAX_TARGETS.nssf + TAX_TARGETS.shif + TAX_TARGETS.housing)}</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>Expenses: {formatKES(animatedTotal)}</span>
          </div>
        </div>
      </div>

      {/* ──────────────── Title overlay ──────────────── */}
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
          <div style={{ fontSize: 72, fontWeight: 900, color: COLORS.white }}>
            KAZI<span style={{ color: COLORS.red }}>&amp;BUDGET</span>
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: COLORS.yellow,
            }}
          >
            Input Page Walkthrough
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
