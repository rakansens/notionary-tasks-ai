import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Task } from '@/types/models';

export const useTaskDeletion = (
  tasks: Task[], 
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void
) => {
  const { toast } = useToast();

  const deleteChildTasks = async (taskId: number) => {
    try {
      const { data: childTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id')
        .eq('parent_id', taskId);

      if (fetchError) throw fetchError;

      if (childTasks) {
        for (const childTask of childTasks) {
          await deleteChildTasks(childTask.id);
        }
      }

      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('parent_id', taskId);

      if (deleteError) throw deleteError;
    } catch (error) {
      console.error('Error deleting child tasks:', error);
      throw error;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await deleteChildTasks(id);

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prevTasks => {
        const removeTask = (tasks: Task[]): Task[] => {
          return tasks.filter(task => {
            if (task.id === id) return false;
            if (task.subtasks) {
              task.subtasks = removeTask(task.subtasks);
            }
            return true;
          });
        };
        return removeTask(prevTasks);
      });
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
    deleteTask
  };
};