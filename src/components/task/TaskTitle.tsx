import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TaskTitleProps {
  title: string;
  completed: boolean;
  isEditing: boolean;
  hasSubtasks: boolean;
  isCollapsed: boolean;
  onTitleChange: (title: string) => void;
  onTitleClick: () => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onToggleCollapse: () => void;
  hierarchyLevel: number;
}

export const TaskTitle = ({
  title,
  completed,
  isEditing,
  hasSubtasks,
  isCollapsed,
  onTitleClick,
  onBlur,
  onKeyPress,
  onToggleCollapse,
  hierarchyLevel,
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
    <div className="flex items-center gap-1">
      {hasSubtasks && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
      )}
      <span
        className={cn(
          "flex-1 text-sm transition-all duration-200 cursor-pointer",
          completed && "line-through text-notion-secondary",
          hierarchyLevel > 0 && "ml-4"
        )}
        onClick={onTitleClick}
      >
        {title}
      </span>
    </div>
  );
};