import { Plus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

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
  const [hasUserInput, setHasUserInput] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;
    
    if (isGroupMode) {
      window.dispatchEvent(new CustomEvent('addGroup', {
        detail: {
          name: trimmedValue,
        }
      }));
    } else {
      onSubmit();
    }
  };

  useEffect(() => {
    const handleGroupAdded = () => {
      onChange('');
      setHasUserInput(false);
      setIsGroupMode(false);
    };

    window.addEventListener('groupAdded', handleGroupAdded);
    return () => {
      window.removeEventListener('groupAdded', handleGroupAdded);
    };
  }, [onChange]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape" && onCancel) {
      onCancel();
      setIsGroupMode(false);
      setHasUserInput(false);
    }
  };

  const handleBlur = () => {
    if (!value.trim() && onCancel) {
      onCancel();
      setIsGroupMode(false);
      setHasUserInput(false);
    }
  };

  const toggleMode = () => {
    setIsGroupMode(!isGroupMode);
    onChange('');
    setHasUserInput(false);
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setHasUserInput(newValue.trim() !== '');
  };

  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      {!groupId && (
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
      )}
      {groupId && (
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 rounded-sm border border-notion-border group-hover:border-notion-primary/50 transition-colors duration-200"
          onClick={handleSubmit}
        >
          <Plus className="h-3 w-3 text-notion-secondary group-hover:text-notion-primary group-hover:scale-110 transition-all duration-200" />
        </Button>
      )}
      <Input
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
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