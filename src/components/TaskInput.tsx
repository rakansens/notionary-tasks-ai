import { Plus, FolderPlus } from "lucide-react";
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
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);

  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (trimmedValue || !isGroupMode) {
      if (isGroupMode) {
        window.dispatchEvent(new CustomEvent('groupAdded', {
          detail: {
            title: trimmedValue,
            addedAt: new Date(),
          },
          bubbles: true,
          composed: true
        }));
      } else if (isEditing && hasBeenEdited) {
        onSubmit();
      }
      onChange('');
      setIsGroupMode(false);
      setIsEditing(false);
      setHasBeenEdited(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape" && onCancel) {
      onCancel();
      setIsGroupMode(false);
      setIsEditing(false);
      setHasBeenEdited(false);
    }
  };

  const handleBlur = () => {
    if (!value.trim() && onCancel) {
      onCancel();
      setIsGroupMode(false);
      setIsEditing(false);
      setHasBeenEdited(false);
    }
  };

  const toggleMode = () => {
    setIsGroupMode(!isGroupMode);
    onChange('');
    setHasBeenEdited(false);
  };

  const handleInputFocus = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setHasBeenEdited(true);
  };

  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 rounded-sm border border-notion-border group-hover:border-notion-primary/50 transition-colors duration-200"
        onClick={toggleMode}
      >
        {isGroupMode ? (
          <FolderPlus className="h-3 w-3 text-notion-secondary group-hover:text-notion-primary group-hover:scale-110 transition-all duration-200" />
        ) : (
          <Plus className="h-3 w-3 text-notion-secondary group-hover:text-notion-primary group-hover:scale-110 transition-all duration-200" />
        )}
      </Button>
      <Input
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        onBlur={handleBlur}
        onFocus={handleInputFocus}
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