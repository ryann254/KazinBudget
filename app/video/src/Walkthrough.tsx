import { Series } from "remotion";
import { InputPage } from "./pages/input/InputPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { TOTAL_FRAMES as INPUT_FRAMES } from "./pages/input/timeline";
import { TOTAL_FRAMES as DASHBOARD_FRAMES } from "./pages/dashboard/timeline";

export const WALKTHROUGH_TOTAL_FRAMES = INPUT_FRAMES + DASHBOARD_FRAMES;

export const Walkthrough: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={INPUT_FRAMES}>
        <InputPage />
      </Series.Sequence>
      <Series.Sequence durationInFrames={DASHBOARD_FRAMES}>
        <DashboardPage />
      </Series.Sequence>
    </Series>
  );
};
