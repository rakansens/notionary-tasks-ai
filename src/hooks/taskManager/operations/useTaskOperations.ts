import { Task } from '@/types/models';
import { useTaskCreation } from './useTaskCreation';
import { useTaskModification } from './useTaskModification';
import { useTaskDeletion } from './useTaskDeletion';
import { useCallback } from 'react';

export const useTaskOperations = (
  tasks: Task[], 
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void
) => {
  const taskCreation = useTaskCreation(tasks, setTasks);
  const taskModification = useTaskModification(tasks, setTasks);
  const taskDeletion = useTaskDeletion(tasks, setTasks);

  // メモ化されたタスク更新関数
  const updateTasksWithStructure = useCallback((newTasks: Task[]) => {
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

    setTasks(buildTaskHierarchy(newTasks));
  }, [setTasks]);

  return {
    ...taskCreation,
    ...taskModification,
    ...taskDeletion,
    updateTasksWithStructure,
  };
};