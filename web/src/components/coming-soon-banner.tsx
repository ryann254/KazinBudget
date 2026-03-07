import { MapPinOff } from "lucide-react";

type ComingSoonBannerProps = {
  location: string;
};

export function ComingSoonBanner({ location }: ComingSoonBannerProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
          <MapPinOff className="size-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200">
            Coming Soon!
          </h3>
          <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-300">
            We're expanding to {location} soon! For now, KaziBudget covers
            Nairobi and the greater metro area.
          </p>
        </div>
      </div>
    </div>
  );
}
