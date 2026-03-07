import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, ChevronsUpDown, Check } from "lucide-react";
import { searchAreas } from "@kazibudget/shared/src/geo/area-matcher";
import type {
  NairobiZone,
  AreaLookupResult,
} from "@kazibudget/shared/src/geo/types";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

const ZONE_BADGE_STYLES: Record<NairobiZone, string> = {
  PREMIUM:
    "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700",
  MIDDLE:
    "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
  BUDGET:
    "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700",
  SATELLITE:
    "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700",
};

const ZONE_LABELS: Record<NairobiZone, string> = {
  PREMIUM: "Premium",
  MIDDLE: "Middle",
  BUDGET: "Budget",
  SATELLITE: "Satellite",
};

type LocationComboboxProps = {
  value: string;
  onChange: (value: string, zone: NairobiZone) => void;
  placeholder?: string;
  label?: string;
};

export function LocationCombobox({
  value,
  onChange,
  placeholder = "Search for an area...",
  label,
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AreaLookupResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const matches = searchAreas(searchQuery);
      setResults(matches);
    }, 300);
  }, []);

  useEffect(() => {
    debouncedSearch(query);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debouncedSearch]);

  const handleSelect = (areaName: string, zone: NairobiZone) => {
    onChange(areaName, zone);
    setOpen(false);
    setQuery("");
  };

  const selectedResult = results.find((r) => r.area.name === value);
  const selectedZone = selectedResult?.area.zone;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              !value && "text-muted-foreground"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <MapPin className="size-4 shrink-0 opacity-50" />
              {value ? (
                <span className="flex items-center gap-2">
                  <span className="truncate">{value}</span>
                  {selectedZone && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0 leading-4 font-semibold",
                        ZONE_BADGE_STYLES[selectedZone]
                      )}
                    >
                      {ZONE_LABELS[selectedZone]}
                    </Badge>
                  )}
                </span>
              ) : (
                placeholder
              )}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={placeholder}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>No matching areas found</CommandEmpty>
              {results.length > 0 && (
                <CommandGroup>
                  {results.map((result) => (
                    <CommandItem
                      key={result.area.name}
                      value={result.area.name}
                      onSelect={() =>
                        handleSelect(result.area.name, result.area.zone)
                      }
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          value === result.area.name
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span className="flex-1 truncate">
                        {result.area.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "ml-auto text-[10px] px-1.5 py-0 leading-4 font-semibold",
                          ZONE_BADGE_STYLES[result.area.zone]
                        )}
                      >
                        {ZONE_LABELS[result.area.zone]}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
