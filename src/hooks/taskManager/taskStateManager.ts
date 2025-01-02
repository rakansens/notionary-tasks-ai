import { useState } from 'react';
import { Task, Group, DeleteTarget } from './types';

export const useTaskStateManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [addingSubtaskId, setAddingSubtaskId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set());

  const structureTasks = (flatTasks: Task[]): Task[] => {
    const taskMap = new Map<number, Task>();
    const rootTasks: Task[] = [];

    // First pass: Create task objects with empty subtasks arrays
    flatTasks.forEach(task => {
      const taskWithSubtasks = { ...task, subtasks: [] };
      taskMap.set(task.id, taskWithSubtasks);
    });

    // Second pass: Build the tree structure
    flatTasks.forEach(task => {
      if (task.parentId) {
        const parentTask = taskMap.get(task.parentId);
        if (parentTask) {
          // サブタスクを親タスクのsubtasks配列に追加
          parentTask.subtasks = [...(parentTask.subtasks || []), taskMap.get(task.id)!];
        }
      } else {
        rootTasks.push(taskMap.get(task.id)!);
      }
    });

    return rootTasks;
  };

  const setStructuredTasks = (tasksOrUpdater: Task[] | ((prev: Task[]) => Task[])) => {
    if (typeof tasksOrUpdater === 'function') {
      setTasks(prev => {
        const updatedTasks = tasksOrUpdater(prev);
        return structureTasks(updatedTasks);
      });
    } else {
      setTasks(structureTasks(tasksOrUpdater));
    }
  };

  return {
    state: {
      tasks,
      groups,
      newTask,
      newGroup,
      isAddingGroup,
      editingTaskId,
      editingGroupId,
      addingSubtaskId,
      deleteTarget,
      collapsedGroups,
    },
    setters: {
      setTasks: setStructuredTasks,
      setGroups,
      setNewTask,
      setNewGroup,
      setIsAddingGroup,
      setEditingTaskId,
      setEditingGroupId,
      setAddingSubtaskId,
      setDeleteTarget,
      setCollapsedGroups,
    },
  };
};