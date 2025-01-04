import { Task } from "./types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useTaskOperationsHook = (
  tasks: Task[],
  setTasks: (tasks: Task[]) => void,
  findTaskById: (tasks: Task[], id: number) => Task | undefined
) => {
  const { toast } = useToast();

  const toggleTask = async (id: number) => {
    try {
      const task = findTaskById(tasks, id);
      if (task) {
        const { error } = await supabase
          .from('tasks')
          .update({ completed: !task.completed })
          .eq('id', id);

        if (error) throw error;

        setTasks(tasks.map(t =>
          t.id === id ? { ...t, completed: !t.completed } : t
        ));
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

      setTasks(tasks.map(task =>
        task.id === id ? { ...task, title } : task
      ));
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

      setTasks(tasks.filter(task => task.id !== id));
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