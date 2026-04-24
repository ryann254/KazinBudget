import { Series } from "remotion";
import { InputPage } from "./pages/input/InputPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { GrowthPage } from "./pages/growth/GrowthPage";
import { ComparePage } from "./pages/compare/ComparePage";
import { OutroPage } from "./pages/outro/OutroPage";
import { TOTAL_FRAMES as INPUT_FRAMES } from "./pages/input/timeline";
import { TOTAL_FRAMES as DASHBOARD_FRAMES } from "./pages/dashboard/timeline";
import { TOTAL_FRAMES as GROWTH_FRAMES } from "./pages/growth/timeline";
import { TOTAL_FRAMES as COMPARE_FRAMES } from "./pages/compare/timeline";
import { TOTAL_FRAMES as OUTRO_FRAMES } from "./pages/outro/timeline";

export const WALKTHROUGH_TOTAL_FRAMES =
  INPUT_FRAMES +
  DASHBOARD_FRAMES +
  GROWTH_FRAMES +
  COMPARE_FRAMES +
  OUTRO_FRAMES;

export const Walkthrough: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={INPUT_FRAMES}>
        <InputPage />
      </Series.Sequence>
      <Series.Sequence durationInFrames={DASHBOARD_FRAMES}>
        <DashboardPage />
      </Series.Sequence>
      <Series.Sequence durationInFrames={GROWTH_FRAMES}>
        <GrowthPage />
      </Series.Sequence>
      <Series.Sequence durationInFrames={COMPARE_FRAMES}>
        <ComparePage />
      </Series.Sequence>
      <Series.Sequence durationInFrames={OUTRO_FRAMES}>
        <OutroPage />
      </Series.Sequence>
    </Series>
  );
};
