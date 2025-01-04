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

  const toggleTask = async (taskId: number, parentId?: number) => {
    try {
      const task = findTaskInHierarchy(tasks, taskId);
      if (!task) return;

      const newCompleted = !task.completed;
      console.log('Toggling task:', taskId, 'to', newCompleted);
      
      // 楽観的更新を実装
      const updatedTasks = updateTasksRecursively(tasks, taskId, task => ({
        ...task,
        completed: newCompleted
      }));

      // 即座にUIを更新
      setTasks(updatedTasks);

      // その後でサーバーに更新を送信
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newCompleted })
        .eq('id', taskId);

      if (error) {
        // エラーが発生した場合は元の状態に戻す
        console.error('Error updating task in Supabase:', error);
        setTasks(tasks);
        throw error;
      }

      console.log('Task updated successfully:', taskId);

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
      // 楽観的更新を実装
      const updatedTasks = updateTasksRecursively(tasks, taskId, task => ({
        ...task,
        title
      }));
      
      // 即座にUIを更新
      setTasks(updatedTasks);

      const { error } = await supabase
        .from('tasks')
        .update({ title })
        .eq('id', taskId);

      if (error) {
        // エラーが発生した場合は元の状態に戻す
        setTasks(tasks);
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

  const deleteTaskAndSubtasks = async (taskId: number) => {
    const task = findTaskInHierarchy(tasks, taskId);
    if (!task) return;

    if (task.subtasks && task.subtasks.length > 0) {
      for (const subtask of task.subtasks) {
        await deleteTaskAndSubtasks(subtask.id);
      }
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      throw error;
    }
  };

  const deleteTask = async (taskId: number, parentId?: number) => {
    try {
      // 楽観的更新を実装
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

      // 即座にUIを更新
      const updatedTasks = removeTaskFromList(tasks);
      setTasks(updatedTasks);

      // その後でサーバーに削除を送信
      await deleteTaskAndSubtasks(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      // エラーが発生した場合は元の状態に戻す
      setTasks(tasks);
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