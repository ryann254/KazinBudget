import "./index.css";
import { Composition } from "remotion";
import { InputPage } from "./pages/input/InputPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { Walkthrough, WALKTHROUGH_TOTAL_FRAMES } from "./Walkthrough";
import { TOTAL_FRAMES as INPUT_FRAMES, FPS } from "./pages/input/timeline";
import { TOTAL_FRAMES as DASHBOARD_FRAMES } from "./pages/dashboard/timeline";

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
    </>
  );
};
