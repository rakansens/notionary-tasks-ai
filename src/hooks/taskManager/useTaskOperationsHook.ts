import { Task } from './types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useTaskOperationsHook = (tasks: Task[], setTasks: (tasks: Task[]) => void) => {
  const { toast } = useToast();

  const updateTasksRecursively = (tasks: Task[], taskId: number, updater: (task: Task) => Task): Task[] => {
    return tasks.map(task => {
      if (task.id === taskId) {
        return updater(task);
      }
      if (task.subtasks && task.subtasks.length > 0) {
        return {
          ...task,
          subtasks: updateTasksRecursively(task.subtasks, taskId, updater)
        };
      }
      return task;
    });
  };

  const toggleTask = async (taskId: number, parentId?: number) => {
    try {
      const task = findTaskInHierarchy(tasks, taskId);
      if (!task) return;

      const newCompleted = !task.completed;
      
      await supabase
        .from('tasks')
        .update({ completed: newCompleted })
        .eq('id', taskId);

      const updatedTasks = updateTasksRecursively(tasks, taskId, task => ({
        ...task,
        completed: newCompleted
      }));

      setTasks(updatedTasks);
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
      await supabase
        .from('tasks')
        .update({ title })
        .eq('id', taskId);

      const updatedTasks = updateTasksRecursively(tasks, taskId, task => ({
        ...task,
        title
      }));

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

  const deleteTask = async (taskId: number, parentId?: number) => {
    try {
      await deleteTaskAndSubtasks(taskId);
      
      const removeTaskFromList = (tasks: Task[]): Task[] => {
        return tasks.filter(task => {
          if (task.id === taskId) {
            return false;
          }
          if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks = removeTaskFromList(task.subtasks);
          }
          return true;
        });
      };

      const updatedTasks = removeTaskFromList(tasks);
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

  const deleteTaskAndSubtasks = async (taskId: number) => {
    const task = findTaskInHierarchy(tasks, taskId);
    if (!task) return;

    if (task.subtasks && task.subtasks.length > 0) {
      for (const subtask of task.subtasks) {
        await deleteTaskAndSubtasks(subtask.id);
      }
    }

    await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
  };

  const findTaskInHierarchy = (tasks: Task[], taskId: number): Task | undefined => {
    for (const task of tasks) {
      if (task.id === taskId) {
        return task;
      }
      if (task.subtasks && task.subtasks.length > 0) {
        const found = findTaskInHierarchy(task.subtasks, taskId);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  };

  return {
    toggleTask,
    updateTaskTitle,
    deleteTask
  };
};