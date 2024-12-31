import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TaskCheckboxProps {
  completed: boolean;
  onClick: () => void;
}

export const TaskCheckbox = ({ completed, onClick }: TaskCheckboxProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-4 w-4 rounded-sm border transition-colors duration-200",
        completed ? "bg-notion-primary border-notion-primary" : "border-notion-border"
      )}
      onClick={onClick}
    >
      {completed && <Check className="h-3 w-3 text-white" />}
    </Button>
  );
};