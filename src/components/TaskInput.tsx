import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TaskInputProps {
  onSubmit: () => void;
  onCancel?: () => void;
  groupId?: number;
  autoFocus?: boolean;
  className?: string;
}

export const TaskInput = ({ 
  onSubmit,
  onCancel,
  groupId,
  autoFocus,
  className
}: TaskInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    if (inputValue.trim()) {
      // Dispatch new task added event
      window.dispatchEvent(new CustomEvent('taskAdded', {
        detail: {
          title: inputValue,
          addedAt: new Date(),
          groupId: groupId || null
        },
        bubbles: true,
        composed: true
      }));
      onSubmit();
      setInputValue(''); // Clear the input after submission
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // 入力候補表示中（IME変換中）はエンターでの送信を防ぐ
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSubmit();
    } else if (e.key === "Escape" && onCancel) {
      onCancel();
    }
  };

  const handleBlur = () => {
    if (!inputValue.trim() && onCancel) {
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
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
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