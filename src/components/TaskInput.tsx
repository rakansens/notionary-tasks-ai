import { Plus, FolderPlus } from "lucide-react";
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
  isGroupMode?: boolean;
}

export const TaskInput = ({ 
  value, 
  onChange, 
  onSubmit,
  onCancel,
  groupId,
  autoFocus,
  className,
  isGroupMode = false
}: TaskInputProps) => {
  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      // Dispatch new task added event
      window.dispatchEvent(new CustomEvent('taskAdded', {
        detail: {
          title: trimmedValue,
          addedAt: new Date(),
          groupId: groupId || null,
          isGroup: isGroupMode
        },
        bubbles: true,
        composed: true
      }));
      onSubmit();
      onChange(''); // Clear the input after submission
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // IME入力中はエンターでの送信を防ぐ
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
      e.preventDefault(); // エンターキーのデフォルト動作を防ぐ
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
        {isGroupMode ? (
          <FolderPlus className="h-3 w-3 text-[#9b87f5] group-hover:text-[#8a73f4] group-hover:scale-110 transition-all duration-200" />
        ) : (
          <Plus className="h-3 w-3 text-notion-secondary group-hover:text-notion-primary group-hover:scale-110 transition-all duration-200" />
        )}
      </Button>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyPress}
        onBlur={handleBlur}
        placeholder={isGroupMode ? "新しいグループを追加..." : "新しいタスクを追加..."}
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