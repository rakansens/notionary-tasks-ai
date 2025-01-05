import { PomodoroHeader } from "../pomodoro/PomodoroHeader";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const TaskHeader = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { tasks, groups, updateTaskOrder } = useTaskContext();
  const { toast } = useToast();

  const handleClearAllTasks = async () => {
    try {
      // 全てのタスクを削除
      const { error } = await supabase
        .from('tasks')
        .delete()
        .neq('id', 0); // 全てのタスクを削除

      if (error) throw error;

      // ローカルの状態を更新
      updateTaskOrder([]);
      
      toast({
        title: "タスクを全て削除しました",
        description: "全てのタスクが正常に削除されました。",
      });
    } catch (error) {
      console.error('Error clearing tasks:', error);
      toast({
        title: "エラー",
        description: "タスクの削除中にエラーが発生しました。",
        variant: "destructive",
      });
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="p-4 border-b border-notion-border flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-medium text-notion-primary">タスク管理</h2>
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          全タスク削除
        </Button>
      </div>
      <PomodoroHeader />

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleClearAllTasks}
        title="全タスクの削除"
        description="本当に全てのタスクを削除しますか？この操作は取り消せません。"
      />
    </div>
  );
};