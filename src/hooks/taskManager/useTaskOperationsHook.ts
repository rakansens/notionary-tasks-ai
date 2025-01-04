import { Task } from './types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useTaskOperationsHook = (tasks: Task[], setTasks: (tasks: Task[]) => void) => {
  const { toast } = useToast();

  // 新しい状態更新関数
  const updateTaskState = (taskId: number, updates: Partial<Task>) => {
    setTasks((prevTasks: Task[]): Task[] => {
      const newTasks = prevTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, ...updates };
        }
        if (task.subtasks && task.subtasks.length > 0) {
          return {
            ...task,
            subtasks: updateSubtasks(task.subtasks, taskId, updates)
          };
        }
        return task;
      });
      return newTasks;
    });
  };

  // サブタスクの更新を再帰的に処理
  const updateSubtasks = (subtasks: Task[], taskId: number, updates: Partial<Task>): Task[] => {
    return subtasks.map(subtask => {
      if (subtask.id === taskId) {
        return { ...subtask, ...updates };
      }
      if (subtask.subtasks && subtask.subtasks.length > 0) {
        return {
          ...subtask,
          subtasks: updateSubtasks(subtask.subtasks, taskId, updates)
        };
      }
      return subtask;
    });
  };

  const toggleTask = async (taskId: number, parentId?: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newCompleted = !task.completed;
      
      // 即座に状態を更新
      updateTaskState(taskId, { completed: newCompleted });

      // その後でサーバーに更新を送信
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newCompleted })
        .eq('id', taskId);

      if (error) {
        // エラー時は元の状態に戻す
        updateTaskState(taskId, { completed: !newCompleted });
        throw error;
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "エラー",
        description: "タスクの状態の更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  const updateTaskTitle = async (taskId: number, title: string, parentId?: number) => {
    try {
      // 即座に状態を更新
      updateTaskState(taskId, { title });

      const { error } = await supabase
        .from('tasks')
        .update({ title })
        .eq('id', taskId);

      if (error) {
        // エラー時は元の状態に戻す
        const originalTask = tasks.find(t => t.id === taskId);
        if (originalTask) {
          updateTaskState(taskId, { title: originalTask.title });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error updating task title:', error);
      toast({
        title: "エラー",
        description: "タスクのタイトル更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: number, parentId?: number) => {
    try {
      // 現在の状態を保存
      const currentTasks = [...tasks];

      // 即座に状態を更新
      setTasks((prevTasks: Task[]): Task[] => 
        prevTasks.map(task => ({
          ...task,
          subtasks: task.subtasks ? 
            task.subtasks.filter(t => t.id !== taskId).map(t => ({
              ...t,
              subtasks: t.subtasks ? t.subtasks.filter(st => st.id !== taskId) : []
            })) : 
            []
        })).filter(task => task.id !== taskId)
      );

      // サーバーに削除を送信
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        // エラー時は元の状態に戻す
        setTasks(currentTasks);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "エラー",
        description: "タスクの削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  return {
    toggleTask,
    updateTaskTitle,
    deleteTask
  };
};