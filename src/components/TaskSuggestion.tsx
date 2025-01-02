import { useState } from "react";
import { TaskCheckbox } from "./task/TaskCheckbox";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskSuggestionProps {
  suggestion: {
    id: number;
    title: string;
    subtasks?: Array<{
      id: number;
      title: string;
    }>;
  };
  onAdd: (suggestion: { title: string }) => void;
}

export const TaskSuggestion = ({ suggestion, onAdd }: TaskSuggestionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(suggestion.title);

  const handleAdd = () => {
    onAdd({
      title: editedTitle,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      setIsEditing(false);
    } else if (e.key === "Escape") {
      setEditedTitle(suggestion.title);
      setIsEditing(false);
    }
  };

  return (
    <div className="group flex items-center gap-2 py-0.5">
      <TaskCheckbox completed={false} onClick={() => {}} />
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm"
            autoFocus
          />
        ) : (
          <span
            className="text-sm cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {editedTitle}
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleAdd}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};