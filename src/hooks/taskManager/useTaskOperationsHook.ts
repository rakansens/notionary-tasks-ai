import { Task } from './types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useTaskOperationsHook = (tasks: Task[], setTasks: (tasks: Task[]) => void) => {
  const { toast } = useToast();

  const findTaskById = (id: number): Task | undefined => {
    for (const task of tasks) {
      if (task.id === id) return task;
      if (task.subtasks) {
        const found = findTaskById(id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const toggleTask = async (id: number) => {
    try {
      const task = findTaskById(id);
      if (task) {
        const { error } = await supabase
          .from('tasks')
          .update({ completed: !task.completed })
          .eq('id', id);

        if (error) throw error;

        const updatedTasks = tasks.map(t =>
          t.id === id ? { ...t, completed: !t.completed } : t
        );
        setTasks(updatedTasks);
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

  const updateTaskTitle = async (id: number, title: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ title })
        .eq('id', id);

      if (error) throw error;

      const updatedTasks = tasks.map(task =>
        task.id === id ? { ...task, title } : task
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error updating task title:', error);
      toast({
        title: "エラー",
        description: "タスクのタイトル更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
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
    deleteTask,
  };
};