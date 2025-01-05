import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTaskContext } from "@/contexts/TaskContext";
import { useState } from "react";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

export const TaskHeader = () => {
  const { tasks, deleteTask } = useTaskContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRefreshClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    tasks.forEach(task => {
      deleteTask(task.id);
    });
    setShowDeleteConfirm(false);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h1 className="text-xl font-semibold">タスク</h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRefreshClick}
        className="hover:bg-red-100 transition-colors"
      >
        <RefreshCw className="h-4 w-4 text-red-500" />
      </Button>

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="全タスクの削除"
        description="本当に全てのタスクを削除してもよろしいですか？この操作は取り消せません。"
      />
    </div>
  );
};