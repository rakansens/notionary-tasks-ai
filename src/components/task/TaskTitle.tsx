import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TaskTitleProps {
  title: string;
  completed: boolean;
  isEditing: boolean;
  onTitleChange: (title: string) => void;
  onTitleClick: () => void;
  onBlur: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const TaskTitle = ({
  title,
  completed,
  isEditing,
  onTitleChange,
  onTitleClick,
  onBlur,
  onKeyPress,
}: TaskTitleProps) => {
  if (isEditing) {
    return (
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            onKeyPress(e);
          }
        }}
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