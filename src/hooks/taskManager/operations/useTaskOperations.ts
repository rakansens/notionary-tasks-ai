import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTaskEvents } from '../useTaskEvents';
import { Task } from '@/types/models';
import { TaskResponse } from '@/types/api';
import { TasksUpdateFunction } from '@/types/utils';

export const useTaskOperations = (
  tasks: Task[], 
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void
) => {
  const { toast } = useToast();
  const taskEvents = useTaskEvents();

  const findTaskById = (tasks: Task[], id: number): Task | undefined => {
    for (const task of tasks) {
      if (task.id === id) return task;
      if (task.subtasks) {
        const found = findTaskById(task.subtasks, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const createNewTask = (
    title: string,
    groupId?: number,
    parentId?: number,
    order?: number,
    parentTask?: Task | null
  ): Task => {
    const level = parentTask ? parentTask.level + 1 : 1;
    return {
      id: Date.now(),
      title,
      completed: false,
      groupId: groupId || null,
      parentId: parentId || null,
      order: order || 0,
      level,
      addedAt: new Date(),
      subtasks: [],
    };
  };

  const addTask = async (groupId?: number, parentId?: number, title?: string) => {
    try {
      const trimmedTask = title?.trim();
      if (!trimmedTask) return;

      const parentTask = parentId ? findTaskById(tasks, parentId) : null;
      const level = parentTask ? parentTask.level + 1 : 1;
      
      const newTask = createNewTask(
        trimmedTask,
        groupId,
        parentId,
        tasks.length,
        parentTask
      );

      const { data: savedTask, error } = await supabase
        .from('tasks')
        .insert({
          title: newTask.title,
          completed: newTask.completed,
          order_position: newTask.order,
          group_id: newTask.groupId,
          parent_id: newTask.parentId,
          level: level
        })
        .select()
        .single();

      if (error) throw error;

      const taskWithId: Task = {
        ...newTask,
        id: savedTask.id,
        level: savedTask.level
      };

      setTasks(prevTasks => [...prevTasks, taskWithId]);
      return taskWithId;
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "エラー",
        description: "タスクの追加に失敗しました",
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleTask = async (id: number) => {
    try {
      const task = findTaskById(tasks, id);
      if (!task) return;

      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', id);

      if (error) throw error;

      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );
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

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? { ...task, title } : task
        )
      );
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

      setTasks(prevTasks =>
        prevTasks.filter(task => task.id !== id)
      );
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
    findTaskById,
    createNewTask,
    addTask,
    toggleTask,
    updateTaskTitle,
    deleteTask,
  };
};