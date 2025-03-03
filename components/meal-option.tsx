import { Check } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MealOption = "breakfast" | "lunch" | "dinner";

interface MealOptionProps {
  icon: ReactNode;
  label: string;
  value: MealOption;
  onSelect: (value: MealOption) => void;
  selected: boolean;
}

export function MealOptionPill({ icon, label, value, selected, onSelect }: MealOptionProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex-1 relative flex items-center justify-center rounded-full border py-2 px-3 transition-all duration-200 ease-in-out min-w-12",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background hover:border-primary/50 hover:bg-primary/5"
      )}
      onClick={() => onSelect(value)}
      aria-checked={selected}
      role="radio"
    >
      <span className="text-base mr-1.5">{icon}</span>
      <span className="text-sm font-medium">{label.charAt(0).toUpperCase() + label.slice(1)}</span>
      {selected && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-2 w-2" />
        </span>
      )}
    </button>
  );
}
