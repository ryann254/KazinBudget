import "./index.css";
import { Composition } from "remotion";
import { InputPage } from "./pages/input/InputPage";
import { TOTAL_FRAMES, FPS } from "./pages/input/timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="InputPage"
        component={InputPage}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
