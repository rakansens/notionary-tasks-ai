import { useState } from 'react';
import { Task, Group, DeleteTarget } from './types';

export const useTaskState = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [addingSubtaskId, setAddingSubtaskId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set());

  const structureTasks = (flatTasks: Task[]): Task[] => {
    const taskMap = new Map<number, Task>();
    
    // まず、すべてのタスクを複製してマップに追加
    flatTasks.forEach(task => {
      taskMap.set(task.id, {
        ...task,
        subtasks: [],
      });
    });

    // 親子関係を構築
    flatTasks.forEach(task => {
      if (task.parentId) {
        const parentTask = taskMap.get(task.parentId);
        const currentTask = taskMap.get(task.id);
        
        if (parentTask && currentTask) {
          if (!parentTask.subtasks) {
            parentTask.subtasks = [];
          }
          parentTask.subtasks.push(currentTask);
          parentTask.subtasks.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
      }
    });

    // ルートタスクのみを返す
    return flatTasks
      .filter(task => !task.parentId)
      .map(task => taskMap.get(task.id))
      .filter((task): task is Task => task !== undefined)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
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