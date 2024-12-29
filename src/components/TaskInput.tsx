import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  groupId?: number;
  autoFocus?: boolean;
}

export const TaskInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  onCancel,
  groupId,
  autoFocus 
}: TaskInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit();
    } else if (e.key === "Escape" && onCancel) {
      onCancel();
    }
  };

  const handleBlur = () => {
    if (!value.trim() && onCancel) {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 rounded-md border border-input"
        onClick={() => onSubmit()}
      >
        <Plus className="h-3 w-3" />
      </Button>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyPress}
        onBlur={handleBlur}
        placeholder="新しいタスクを追加..."
        className={cn("flex-1", !groupId && "h-7 py-0")}
        autoFocus={autoFocus}
      />
    </div>
  );
};