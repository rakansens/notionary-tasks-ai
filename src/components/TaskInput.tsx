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
  className?: string;
  groupName?: string;
  parentTaskTitle?: string;
}

export const TaskInput = ({ 
  value, 
  onChange, 
  onSubmit,
  onCancel,
  groupId,
  autoFocus,
  className,
  groupName,
  parentTaskTitle
}: TaskInputProps) => {
  const handleSubmit = () => {
    if (value.trim()) {
      // Dispatch new task added event with group information
      window.dispatchEvent(new CustomEvent('taskAdded', {
        detail: {
          title: value,
          addedAt: new Date(),
          groupId: groupId || null,
          groupName: groupName || null,
          parentTaskTitle: parentTaskTitle || null
        },
        bubbles: true,
        composed: true
      }));
      onSubmit();
      onChange(''); // Clear the input after submission
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSubmit();
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
    <div className={cn("flex items-center gap-2 group", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 rounded-sm border border-notion-border group-hover:border-notion-primary/50 transition-colors duration-200"
        onClick={handleSubmit}
      >
        <Plus className="h-3 w-3 text-notion-secondary group-hover:text-notion-primary group-hover:scale-110 transition-all duration-200" />
      </Button>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyPress}
        onBlur={handleBlur}
        placeholder="新しいタスクを追加..."
        className={cn(
          "flex-1 h-8 text-sm bg-transparent border-none focus:ring-0",
          "placeholder:text-notion-secondary",
          "hover:bg-notion-hover/50 focus:bg-white transition-colors duration-200"
        )}
        autoFocus={autoFocus}
      />
    </div>
  );
};