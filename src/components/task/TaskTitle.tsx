import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface TaskTitleProps {
  title: string;
  completed: boolean;
  isEditing: boolean;
  onTitleChange: (title: string) => void;
  onTitleClick: () => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const TaskTitle = ({
  title,
  completed,
  isEditing,
  onTitleClick,
  onBlur,
  onKeyPress,
}: TaskTitleProps) => {
  const [inputValue, setInputValue] = useState(title);

  useEffect(() => {
    setInputValue(title);
  }, [title]);

  if (isEditing) {
    return (
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyPress}
        className="flex-1 h-6 py-0 px-1 bg-transparent border-none focus:ring-0 text-sm"
        autoFocus
      />
    );
  }

  return (
    <span
      className={cn(
        "flex-1 text-sm transition-all duration-200 cursor-pointer",
        completed && "line-through text-notion-secondary"
      )}
      onClick={onTitleClick}
    >
      {title}
    </span>
  );
};