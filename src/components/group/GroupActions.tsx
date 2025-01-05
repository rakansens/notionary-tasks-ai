import { Plus, Trash2 } from "lucide-react";

interface GroupActionsProps {
  onAddTask: () => void;
  onDelete: () => void;
}

export const GroupActions = ({ onAddTask, onDelete }: GroupActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onAddTask}
        className="text-gray-400 hover:text-gray-700"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        className="text-gray-400 hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};