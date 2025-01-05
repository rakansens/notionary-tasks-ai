import { useCallback } from 'react';
import { TaskNode } from "@/types/taskTypes";

export const useTaskStructure = () => {
  const buildTaskTree = useCallback((tasks: TaskNode[]): TaskNode[] => {
    console.log('Building task tree from:', tasks);
    
    const taskMap = new Map<number, TaskNode>();
    const rootTasks: TaskNode[] = [];

    // タスクのマップを作成
    tasks.forEach(task => {
      taskMap.set(task.id, { ...task, subtasks: [] });
    });

    // 親子関係の構築
    tasks.forEach(task => {
      const currentTask = taskMap.get(task.id);
      if (!currentTask) return;

      if (task.parentId) {
        const parentTask = taskMap.get(task.parentId);
        if (parentTask) {
          // レベルの計算と更新
          currentTask.level = Math.min(parentTask.level + 1, 3);
          
          // サブタスクの追加
          parentTask.subtasks = parentTask.subtasks || [];
          parentTask.subtasks.push(currentTask);
          
          // サブタスクを順序でソート
          parentTask.subtasks.sort((a, b) => a.order - b.order);
        }
      } else {
        rootTasks.push(currentTask);
      }
    });

    // ルートタスクを順序でソート
    rootTasks.sort((a, b) => a.order - b.order);
    
    console.log('Built task tree:', rootTasks);
    return rootTasks;
  }, []);

  return { buildTaskTree };
};