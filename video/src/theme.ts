import { loadFont } from "@remotion/google-fonts/WorkSans";

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const COLORS = {
  black: "#0D1B2A",
  cream: "#FEFAE0",
  red: "#E63946",
  blue: "#1D3557",
  yellow: "#F4D35E",
  white: "#FFFFFF",
  muted: "#457B9D",
  teal: "#2A9D8F",
} as const;

export const brutalistCard: React.CSSProperties = {
  border: `3px solid ${COLORS.black}`,
  boxShadow: `4px 4px 0 ${COLORS.black}`,
  backgroundColor: COLORS.white,
};

export const formatKES = (amount: number): string =>
  `KES ${Math.round(amount).toLocaleString("en-KE")}`;
