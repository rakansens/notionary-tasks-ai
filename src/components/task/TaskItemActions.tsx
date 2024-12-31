import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskDropdownMenu } from "../TaskDropdownMenu";

interface TaskItemActionsProps {
  onAddSubtask: () => void;
  onDelete: () => void;
  onDropdownDelete: () => void;
}

export const TaskItemActions = ({
  onAddSubtask,
  onDelete,
  onDropdownDelete,
}: TaskItemActionsProps) => {
  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 hover:bg-notion-hover"
        onClick={onAddSubtask}
      >
        <Plus className="h-3.5 w-3.5 text-notion-secondary" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 hover:bg-notion-hover"
        onClick={onDelete}
      >
        <X className="h-3.5 w-3.5 text-notion-secondary" />
      </Button>
      
      <TaskDropdownMenu onDelete={onDropdownDelete} />
    </div>
  );
};