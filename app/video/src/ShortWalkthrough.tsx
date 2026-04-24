import { Sequence, Series } from "remotion";
import { InputPage } from "./pages/input/InputPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ComparePage } from "./pages/compare/ComparePage";
import { OutroPage } from "./pages/outro/OutroPage";

// Short walkthrough: same pages as the full Walkthrough but with the
// Growth page removed and each remaining page trimmed to its most
// valuable scenes. Targets ≤ 1:45 total runtime.
//
// Each clip is expressed as [startFrame, endFrame] in the *page's own*
// timeline. Wrapping the page in `<Sequence from={-startFrame}>` makes
// useCurrentFrame() start at `startFrame` when the series hits the clip,
// which cleanly skips early scenes. The outer Series.Sequence's
// durationInFrames clips the end.

const INPUT_CLIP = { start: 0, end: 1470 }; // full — keeps intro + takehome
const DASHBOARD_CLIP = { start: 60, end: 900 }; // skip calcIntro, cut food
const COMPARE_CLIP = { start: 30, end: 760 }; // skip header, cut after distribution
const OUTRO_CLIP = { start: 0, end: 100 }; // slightly shorter tail

const inputDur = INPUT_CLIP.end - INPUT_CLIP.start;
const dashDur = DASHBOARD_CLIP.end - DASHBOARD_CLIP.start;
const compareDur = COMPARE_CLIP.end - COMPARE_CLIP.start;
const outroDur = OUTRO_CLIP.end - OUTRO_CLIP.start;

export const SHORT_WALKTHROUGH_TOTAL_FRAMES =
  inputDur + dashDur + compareDur + outroDur;

export const ShortWalkthrough: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={inputDur}>
        <Sequence from={-INPUT_CLIP.start}>
          <InputPage />
        </Sequence>
      </Series.Sequence>
      <Series.Sequence durationInFrames={dashDur}>
        <Sequence from={-DASHBOARD_CLIP.start}>
          <DashboardPage />
        </Sequence>
      </Series.Sequence>
      <Series.Sequence durationInFrames={compareDur}>
        <Sequence from={-COMPARE_CLIP.start}>
          <ComparePage />
        </Sequence>
      </Series.Sequence>
      <Series.Sequence durationInFrames={outroDur}>
        <Sequence from={-OUTRO_CLIP.start}>
          <OutroPage />
        </Sequence>
      </Series.Sequence>
    </Series>
  );
};
