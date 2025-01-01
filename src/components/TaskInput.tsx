import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  groupId?: number;
  autoFocus?: boolean;
  className?: string;
}

export const TaskInput = ({ 
  value, 
  onChange, 
  onSubmit,
  onCancel,
  groupId,
  autoFocus,
  className
}: TaskInputProps) => {
  const [isActive, setIsActive] = useState(false);

  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      window.dispatchEvent(new CustomEvent('taskAdded', {
        detail: {
          title: trimmedValue,
          addedAt: new Date(),
          groupId: groupId || null
        },
        bubbles: true,
        composed: true
      }));
      onSubmit();
      onChange('');
      setIsActive(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsActive(false);
      onChange('');
      if (onCancel) {
        onCancel();
      }
    }
  };

  const handleBlur = () => {
    if (!value.trim() && onCancel) {
      onCancel();
      setIsActive(false);
    }
  };

  const handleButtonClick = () => {
    setIsActive(!isActive);
    if (!isActive) {
      onChange('');
    }
  };

  return (
    <div className={cn("flex items-center gap-2 group relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-4 w-4 rounded-sm border transition-all duration-200",
          isActive 
            ? "border-notion-primary bg-notion-primary/10 text-notion-primary scale-110" 
            : "border-notion-border group-hover:border-notion-primary/50"
        )}
        onClick={handleButtonClick}
      >
        <Plus 
          className={cn(
            "h-3 w-3 transition-all duration-200",
            isActive 
              ? "text-notion-primary scale-110" 
              : "text-notion-secondary group-hover:text-notion-primary group-hover:scale-110"
          )} 
        />
      </Button>
      {isActive && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleBlur}
          placeholder="新しいタスクを追加..."
          className={cn(
            "flex-1 h-8 text-sm bg-white border-none focus:ring-0",
            "placeholder:text-notion-secondary",
            "transition-all duration-200 ease-in-out"
          )}
          autoFocus
        />
      )}
    </div>
  );
};