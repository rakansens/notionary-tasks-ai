import { Task } from '@/types/models';
import { useTaskCreation } from './useTaskCreation';
import { useTaskModification } from './useTaskModification';
import { useTaskDeletion } from './useTaskDeletion';
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useTaskOperations = (
  tasks: Task[], 
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void
) => {
  const { toast } = useToast();
  const taskCreation = useTaskCreation(tasks, setTasks);
  const taskModification = useTaskModification(tasks, setTasks);
  const taskDeletion = useTaskDeletion(tasks, setTasks);

  const updateTasksWithStructure = useCallback(async (newTasks: Task[]) => {
    try {
      const buildTaskHierarchy = (tasks: Task[]): Task[] => {
        const taskMap = new Map<number, Task>();
        const rootTasks: Task[] = [];

        // 全てのタスクをマップに追加
        tasks.forEach(task => {
          taskMap.set(task.id, { ...task, subtasks: [] });
        });

        // 親子関係を構築
        tasks.forEach(task => {
          const taskWithSubtasks = taskMap.get(task.id);
          if (!taskWithSubtasks) return;

          if (task.parentId) {
            const parentTask = taskMap.get(task.parentId);
            if (parentTask) {
              parentTask.subtasks = parentTask.subtasks || [];
              parentTask.subtasks.push(taskWithSubtasks);
            }
          } else {
            rootTasks.push(taskWithSubtasks);
          }
        });

        // サブタスクを順序でソート
        const sortSubtasks = (tasks: Task[]) => {
          tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
          tasks.forEach(task => {
            if (task.subtasks && task.subtasks.length > 0) {
              sortSubtasks(task.subtasks);
            }
          });
        };

        sortSubtasks(rootTasks);
        return rootTasks;
      };

      // タスクの更新をデータベースに反映
      for (const task of newTasks) {
        const parentTask = task.parentId ? newTasks.find(t => t.id === task.parentId) : null;
        const newLevel = parentTask ? Math.min(parentTask.level + 1, 3) : 1;

        const { error } = await supabase
          .from('tasks')
          .update({ 
            order_position: task.order,
            level: newLevel,
            parent_id: task.parentId,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);

        if (error) {
          console.error('Error updating task:', error);
          toast({
            title: "エラー",
            description: "タスクの更新に失敗しました",
            variant: "destructive",
          });
          throw error;
        }
      }

      // 階層構造を再構築してステートを更新
      setTasks(buildTaskHierarchy(newTasks));

    } catch (error) {
      console.error('Error updating tasks structure:', error);
      throw error;
    }
  }, [setTasks, toast]);

  return {
    ...taskCreation,
    ...taskModification,
    ...taskDeletion,
    updateTasksWithStructure,
  };
};