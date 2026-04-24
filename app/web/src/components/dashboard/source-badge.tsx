import { Badge } from "@/components/ui/badge";

type SourceBadgeProps = {
  isAuto: boolean;
};

export function SourceBadge({ isAuto }: SourceBadgeProps) {
  if (isAuto) {
    return <Badge variant="ghost">{`Auto`}</Badge>;
  }

  return <Badge variant="secondary">{`Manual`}</Badge>;
}
