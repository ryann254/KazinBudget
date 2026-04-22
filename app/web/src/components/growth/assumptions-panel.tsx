import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

type Rates = {
  salaryGrowthRate: number;
  rentInflationRate: number;
  foodInflationRate: number;
  transportInflationRate: number;
  generalInflationRate: number;
};

type AssumptionsPanelProps = {
  rates: Rates;
  onRateChange: (rates: Rates) => void;
  viewMode: "nominal" | "real";
  onViewModeChange: (mode: "nominal" | "real") => void;
  onReset: () => void;
};

type SliderConfig = {
  key: keyof Rates;
  label: string;
};

const SLIDER_CONFIGS: SliderConfig[] = [
  { key: "salaryGrowthRate", label: "Salary Growth" },
  { key: "rentInflationRate", label: "Rent Inflation" },
  { key: "foodInflationRate", label: "Food Inflation" },
  { key: "transportInflationRate", label: "Transport Inflation" },
  { key: "generalInflationRate", label: "General Inflation" },
];

function RateSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm text-muted-foreground font-mono">
          {(value * 100).toFixed(1)}%
        </span>
      </div>
      <Slider
        min={0}
        max={20}
        step={0.5}
        value={[value * 100]}
        onValueChange={([v]) => onChange(v / 100)}
      />
    </div>
  );
}

function PanelContent({
  rates,
  onRateChange,
  viewMode,
  onViewModeChange,
  onReset,
}: AssumptionsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">View Mode</span>
        <div className="flex rounded-md border overflow-hidden">
          <button
            type="button"
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "nominal"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-accent"
            )}
            onClick={() => onViewModeChange("nominal")}
          >
            Nominal
          </button>
          <button
            type="button"
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "real"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-accent"
            )}
            onClick={() => onViewModeChange("real")}
          >
            Real
          </button>
        </div>
      </div>

      {SLIDER_CONFIGS.map((config) => (
        <RateSlider
          key={config.key}
          label={config.label}
          value={rates[config.key]}
          onChange={(newValue) =>
            onRateChange({ ...rates, [config.key]: newValue })
          }
        />
      ))}

      <Button variant="outline" className="w-full" onClick={onReset}>
        Reset to Defaults
      </Button>
    </div>
  );
}

export function AssumptionsPanel(props: AssumptionsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden md:block">
        <PanelContent {...props} />
      </div>

      {/* Mobile: collapsible */}
      <div className="md:hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between"
            >
              <span>Assumptions & Settings</span>
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <PanelContent {...props} />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  );
}
