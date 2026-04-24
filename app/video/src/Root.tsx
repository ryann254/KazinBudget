import "./index.css";
import { Composition } from "remotion";
import { InputPage } from "./pages/input/InputPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { GrowthPage } from "./pages/growth/GrowthPage";
import { ComparePage } from "./pages/compare/ComparePage";
import { OutroPage } from "./pages/outro/OutroPage";
import { Walkthrough, WALKTHROUGH_TOTAL_FRAMES } from "./Walkthrough";
import {
  ShortWalkthrough,
  SHORT_WALKTHROUGH_TOTAL_FRAMES,
} from "./ShortWalkthrough";
import { TOTAL_FRAMES as INPUT_FRAMES, FPS } from "./pages/input/timeline";
import { TOTAL_FRAMES as DASHBOARD_FRAMES } from "./pages/dashboard/timeline";
import { TOTAL_FRAMES as GROWTH_FRAMES } from "./pages/growth/timeline";
import { TOTAL_FRAMES as COMPARE_FRAMES } from "./pages/compare/timeline";
import { TOTAL_FRAMES as OUTRO_FRAMES } from "./pages/outro/timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Walkthrough"
        component={Walkthrough}
        durationInFrames={WALKTHROUGH_TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="ShortWalkthrough"
        component={ShortWalkthrough}
        durationInFrames={SHORT_WALKTHROUGH_TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="InputPage"
        component={InputPage}
        durationInFrames={INPUT_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="DashboardPage"
        component={DashboardPage}
        durationInFrames={DASHBOARD_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="GrowthPage"
        component={GrowthPage}
        durationInFrames={GROWTH_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="ComparePage"
        component={ComparePage}
        durationInFrames={COMPARE_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="OutroPage"
        component={OutroPage}
        durationInFrames={OUTRO_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
