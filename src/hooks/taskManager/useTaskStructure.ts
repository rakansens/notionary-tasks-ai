import { useCallback } from 'react';
import { Task } from "@/types/models";
import { calculateTaskLevel } from "@/utils/taskUtils";

export const useTaskStructure = () => {
  const structureTasks = useCallback((flatTasks: Task[]): Task[] => {
    console.log('Structuring tasks input:', flatTasks);
    
    const taskMap = new Map<number, Task>();
    const rootTasks: Task[] = [];

    // タスクのマップを作成
    flatTasks.forEach(task => {
      taskMap.set(task.id, { ...task, subtasks: [] });
    });

    // 親子関係の構築
    flatTasks.forEach(task => {
      const currentTask = taskMap.get(task.id);
      if (!currentTask) return;

      if (task.parentId) {
        const parentTask = taskMap.get(task.parentId);
        if (parentTask) {
          // レベルの計算と更新
          currentTask.level = calculateTaskLevel(currentTask, parentTask);
          
          // サブタスクの追加
          parentTask.subtasks = parentTask.subtasks || [];
          parentTask.subtasks.push(currentTask);
          
          // サブタスクを順序でソート
          parentTask.subtasks.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
      } else {
        rootTasks.push(currentTask);
      }
    });

    // ルートタスクを順序でソート
    rootTasks.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    console.log('Structured tasks output:', rootTasks);
    return rootTasks;
  }, []);

  return { structureTasks };
};