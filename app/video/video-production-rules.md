# Video Production Rules — KaziNBudget

This file is the single source of truth for any agent producing a video in `app/video/`. It encodes the look, pacing, and structure that every KaziNBudget walkthrough must follow so new videos feel like siblings of the existing ones (Input → Dashboard → Growth → Compare → Outro). Read it end-to-end before touching code.

> **Always update this file** whenever you learn something new about what does / doesn't work. The goal is that a future agent, given only a feature brief, can generate a matching video without further guidance.

---

## 1. Core rules (never violate)

- [ ] **One section at a time.** Highlight, enlarge, and center the section under discussion. Dim everything else. Never show the whole page lit up equally.
- [ ] **One page at a time.** Build each page's composition and timeline independently. Stitch them into `Walkthrough.tsx` via `<Series>` only after each page renders correctly standalone.
- [ ] **Highlight before clicking.** Any button / link / card that is about to be "clicked" must first highlight (yellow outline + scale 1.05–1.08 + deeper shadow) for ~12–18 frames before the click beat. Never click a cold element.
- [ ] **Use a pointer for navigation.** When clicking around or moving between pages, render an on-screen cursor (black arrow or brutalist pointer) that slides to the target, settles for a beat, clicks (scale pulse), then moves on. The viewer should always know where the "click" is happening.
- [ ] **Use the `remotion-best-practices` skill for anything you haven't done before.** Load the relevant rule file from `https://github.com/remotion-dev/skills/tree/main/skills/remotion/rules/` for animations, charts, fonts, captions, measuring DOM, Lottie, etc. Do not reinvent patterns Remotion already documents.
- [ ] **Every video gets an intro and outro** showcasing the `KAZI&BUDGET` logo via the shared `BrandTitle` component. Tagline changes per video; animation stays the same.
- [ ] **Update this file when you learn something new.** If the user corrects pacing, styling, or structure — codify it here. If you discover a reusable pattern — add it here. Treat the file as a living spec.

---

## 2. Style & design tokens (reuse, never redefine)

Import from `src/theme.ts`. Do **not** hard-code colors or re-call `loadFont`.

- **Colors** (`COLORS`): `black` `#0D1B2A`, `cream` `#FEFAE0`, `red` `#E63946`, `blue` `#1D3557`, `yellow` `#F4D35E`, `teal` `#2A9D8F`, `muted` `#457B9D`, `white` `#FFFFFF`. Stick to semantic usage: red = tax / below-market / alert, teal = positive / savings / above-market, yellow = highlight / brand accent, blue = personal / informational, muted = labels.
- **Font**: Work Sans via `@remotion/google-fonts/WorkSans`, loaded once in `theme.ts`. Use `fontFamily` from there. Weights: 900 titles, 800 labels, 700 body.
- **Type conventions**: uppercase + `letterSpacing: "0.15em"` for headings; `"— "` muted em-dash prefix on section headings.
- **Brutalist card**: `border: 3px solid #0D1B2A` + `boxShadow: 4px 4px 0 #0D1B2A` + white bg (`brutalistCard` export). Highlighted: scale 1.06–1.08, yellow `outline: 3px solid`, shadow 8×8. Dimmed: opacity 0.3–0.35, `filter: blur(1.6px)`, shadow 2×2.
- **Stamps**: small colored pill, 2–3 px black border, rotate between −2° and +2° for playful asymmetry. Positioned absolutely on section corners.

---

## 3. Animation primitives (drive everything from `frame`)

- **All motion from `useCurrentFrame()`** + `interpolate()` + `Easing.bezier(...)`. **Never** use CSS transitions, Tailwind `animate-*` classes, or `setTimeout`. Each still frame must be fully determined by the frame number.
- **Easings** (from `src/animations.ts`):
  - `easeOutExpo` = `Easing.bezier(0.16, 1, 0.3, 1)` — UI entrances, underline sweeps.
  - `easeInOut` = `Easing.bezier(0.45, 0, 0.55, 1)` — balanced holds.
  - `easeOvershoot` = `Easing.bezier(0.34, 1.56, 0.64, 1)` — playful overshoot on letter drops, chip pops, milestone reveals.
- **Helpers** already available in `animations.ts`:
  - `typed(frame, startFrame, text, charFrames = 2)` — typewriter via string slicing.
  - `countUp(frame, startFrame, durationFrames, target)` — number rolls.
  - `pulse(frame, startFrame, durationFrames = 20)` — half-sine bump.
  - `fadeInUp(frame, startFrame, durationFrames)` — opacity + translateY.
- **Pacing defaults** — respect these or the video feels wrong:
  - Focus ramp in / out: 15 frames each.
  - Button highlight before click: 12–18 frames.
  - Card-by-card cycle: 45–65 frames per card (highlight each with ~10f ramp-in + ~30–45f hold + ~10–15f ramp-out).
  - Graph point-hover: 30–40 frames each so the tooltip reads.
  - Explainer tooltip hold: ≥ 2 seconds (~60 f) of fully opaque time — users must have time to read.
  - Section transition idle before the next action: no more than 20–30 frames. Don't linger.
- When users complain about pacing, err on **slower** for anything with text to read (tooltips, values, narration beats) and **faster** for anything purely decorative (arrivals, fades, transitions).

---

## 4. Section composition pattern (copy from Dashboard / Growth / Compare)

Every page is a **tall vertical stack** with a camera pan. The pattern:

1. `timeline.ts` exports `SCENES` (start + duration per section), `LAYOUT` (heights), `SECTION_Y` (computed), `CAMERA_Y` (computed via `clampScroll(centerOf(y, h))`), `PAGE_HEIGHT`, `TOTAL_FRAMES`, and all hard-coded scene data.
2. `*.Page.tsx` uses `useCurrentFrame()`, computes `sectionFocus(frame)` (0..1 per section, with 15f ramps) and `cameraScrollY(frame)` (piecewise waypoint interpolate).
3. Outer wrapper applies `transform: translateY(-scrollY)` to the tall page so the active section lands in the 1080 px viewport.
4. Each section sits inside a reusable `SectionShell` that consumes `focusStrength` and applies the dim/blur/shadow/scale rules in §2.
5. A **section tracker pill** is pinned bottom-center, listing all scene labels, with the current scene highlighted yellow.

Never skip the tracker pill — it's the viewer's compass.

---

## 5. Charts, graphs, and tooltips

- **Reference `rules/charts.md`** from the Remotion skills repo before starting any chart work.
- **Line / area charts**: draw path left→right via `strokeDasharray={LEN}` + `strokeDashoffset` animated from `LEN → 0` where `LEN` is a safe overestimate (e.g. 3000). Use `Easing.bezier(0.16, 1, 0.3, 1)`.
- **Hover sweep rule**: after the line finishes drawing, a cursor must visit **at least half** of the data points, strictly left→right, pausing long enough to read the tooltip (~30–40 f per point). Cursor = filled circle radius 10, 3 px black border, fill matches series color.
- **Enlarged video tooltip** (bigger than the real web app's): width ~300–320 px, heading ~22 pt (uppercase year / salary), rows ~19 pt, 16×16 colored swatches, 4 px border, 6 px offset shadow, small divider line under the heading.
- **Tooltip row order**: sort rows by numeric value **descending** — the visual order on the chart (top band = highest = first row) must match the list order. Never fixed-order rows when values can cross.
- **Tooltip text color matches series color** with a thin black stroke (~0.4 px) if contrast is marginal (e.g. yellow on white).
- **Tooltip positioning**: anchor above the cursor by default, offset horizontally if the cursor is near the chart edge, and clamp inside the chart padding so nothing clips.
- **Bar / pie chart**: fill animates via `strokeDashoffset` on `<circle>` with `strokeDasharray` (see Dashboard pie) or scaleX on bars. Always count-up the numeric label in sync with the geometry.
- **Distribution / bell curves**: when the data source depends on user inputs (role, experience, location), **show the input change**: highlight + typewriter-retype the changed chip(s) so the viewer knows what caused the reload.

---

## 6. Milestones, cards, and "one-at-a-time" reveals

- Cycle through items left→right or top→bottom. Never highlight two at once unless explicitly relevant.
- Each item's highlight window: `rampIn` + `hold` + `rampOut` summing to the per-item budget. Target `hold` ≥ 30 f when there is tooltip copy attached.
- Non-active items stay visible but dimmed (opacity 0.35, faint blur). Do not hide them.
- When an attached tooltip / explainer card must be readable (e.g. gap analysis), anchor it **above** the highlighted card, centered — don't float it to the side where it can overlap siblings. The user's environment is 1920×1080 and edge-clipping is common; always clamp.

---

## 7. Forms, inputs, and click affordances

- Input fields "type" via `typed()` with `charFrames: 2` (human-scale speed). Show a subtle blinking caret while typing.
- Before clicking a button: highlight it (outline + scale + shadow) for 12–18 f, then a brief "press" beat (scale 0.97 for 2 f) to simulate the click, then commit the state change.
- Route changes (e.g. "click Calculate → go to Dashboard") should include a white-flash frame right after the press and before the next page begins, for a satisfying cut.
- **Cursor / pointer**: when present, it should translate with easeOutExpo to the target, hold briefly on top of the element, fire the click pulse, then move on. It's the one consistent narrator across the video.

---

## 8. Intro and outro (mandatory)

Use the shared `src/components/BrandTitle.tsx` for the wordmark animation so all videos feel like the same family.

- **Intro** (first ~90 frames of the first page):
  - Black AbsoluteFill overlay, letters of `KAZI&BUDGET` drop in with 3-frame stagger and overshoot easing.
  - The `&` pulses after landing.
  - Yellow underline sweeps under the wordmark.
  - Tagline (matches the video's subject) fades up below the underline.
  - Whole overlay fades out as the first real section arrives.
- **Outro** (~120 frames):
  - Dedicated composition (`pages/outro/OutroPage.tsx`), appended as the final `<Series.Sequence>`.
  - Solid black background *separated* from the fading content (so fade-out doesn't leak transparency).
  - Same `BrandTitle` animation, different tagline, plus a small footer CTA.
  - Gentle fade-in (~12 f) and fade-out (~16 f) on the content layer only.

If the feature warrants a punchier outro, add a CTA line; the core animation stays identical.

---

## 9. Page wiring & file structure

```
app/video/src/
  theme.ts                  # COLORS, font, brutalistCard, formatKES
  animations.ts             # easings + typed/countUp/pulse/fadeInUp
  components/BrandTitle.tsx # shared animated wordmark (intro + outro)
  pages/<page>/
    timeline.ts             # SCENES, LAYOUT, SECTION_Y, CAMERA_Y, hard-coded data
    <Page>.tsx              # composition body — driven entirely by useCurrentFrame()
  Walkthrough.tsx           # <Series> stitching all pages
  Root.tsx                  # registers each page + Walkthrough as a Composition
```

When adding a new page:

1. Create `pages/<page>/timeline.ts` with `TOTAL_FRAMES`, `SCENES`, `LAYOUT`, data constants.
2. Create `pages/<page>/<Page>.tsx` reusing `SectionShell`, camera helpers, and `BrandTitle` conventions.
3. Register the composition in `Root.tsx` (1920×1080, fps 30).
4. Append a `<Series.Sequence durationInFrames={PAGE_FRAMES}>` in `Walkthrough.tsx` **before** the outro sequence.
5. Update `WALKTHROUGH_TOTAL_FRAMES` to include the new page.

No default exports in new files. No `export *` barrels. No `any` types; derive from `as const` data where possible.

---

## 10. Verification gates (run every change)

From `app/video/`:

```
npm run lint          # eslint src && tsc — must exit 0
```

Render spot-check stills **at key animation beats** using `--output=` (not `-o`):

```
npx remotion still <CompositionId> --scale=0.5 --frame=<N> --output=/tmp/<label>.png
```

Suggested beats per scene: arrival mid-animation, center-of-highlight for each cycled card, a mid-tooltip frame per chart, a near-end frame for fades. If any still shows overflow, NaN coordinates, empty tooltips, or clipped text — fix before claiming done.

Full render (when the user asks): `npx remotion render <CompositionId> out/<name>.mp4`.

---

## 11. Hard stops (do not do these)

- Do not use CSS `transition`, CSS `animation`, or Tailwind `animate-*` classes.
- Do not call `setTimeout`, `setInterval`, or anything that isn't a pure function of `frame`.
- Do not install new packages unless the user explicitly requests it.
- Do not hard-code hex colors outside `theme.ts`.
- Do not re-call `loadFont` anywhere other than `theme.ts`.
- Do not use `any`. No default exports in application source. No barrel `export *`.
- Do not add emojis, drop-shadows with blur, or gradients outside the approved ambient-glow pattern used in the outro.
- Do not copy the *real* web-app tooltip sizing into videos — video tooltips must be bigger for viewer readability.
- Do not show two sections fully lit at the same time (see rule 1).
- Do not narrate with overlapping text — only one new piece of copy on-screen at any given beat.

---

## 12. When you learn something new

After any task, check whether a new rule, gotcha, or pattern emerged. If yes:

1. Identify the section above it belongs to (or add a new section).
2. Phrase it as a checklist item or a short declarative rule, not a story.
3. Reference the relevant file path or helper so a future agent can apply it directly.
4. Commit the update to this file alongside your code change.

Future self — and future agents — will thank you.
