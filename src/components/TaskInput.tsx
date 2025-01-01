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
  onIconClick?: () => void;
}

export const TaskInput = ({ 
  value, 
  onChange, 
  onSubmit,
  onCancel,
  groupId,
  autoFocus,
  className,
  isGroupMode = false,
  onIconClick
}: TaskInputProps) => {
  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
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
      onChange('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
      e.preventDefault();
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
    <div className={cn("flex items-center gap-2 group relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-4 w-4 rounded-sm border transition-all duration-200",
          isGroupMode 
            ? "border-[#9b87f5] bg-[#9b87f5]/10 hover:bg-[#9b87f5]/20" 
            : "border-notion-border group-hover:border-notion-primary/50"
        )}
        onClick={onIconClick}
        title={isGroupMode ? "タスクモードに切り替え" : "グループモードに切り替え"}
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
          isGroupMode 
            ? "bg-[#9b87f5]/5 hover:bg-[#9b87f5]/10 focus:bg-white" 
            : "hover:bg-notion-hover/50 focus:bg-white",
          "transition-colors duration-200"
        )}
        autoFocus={autoFocus}
      />
      {isGroupMode && (
        <span className="absolute -top-6 left-0 text-xs text-[#9b87f5] bg-[#9b87f5]/10 px-2 py-1 rounded-md animate-fade-in">
          グループモード
        </span>
      )}
    </div>
  );
};