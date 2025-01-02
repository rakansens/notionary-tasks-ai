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
    const deepCloneTask = (task: Task): Task => ({
      ...task,
      subtasks: task.subtasks?.map(subtask => deepCloneTask(subtask)) || [],
    });
    
    const taskMap = new Map<number, Task>();
    flatTasks.forEach(task => {
      if (!taskMap.has(task.id)) {
        taskMap.set(task.id, deepCloneTask(task));
      }
    });

    flatTasks.forEach(task => {
      if (task.parentId) {
        const parentTask = taskMap.get(task.parentId);
        const currentTask = taskMap.get(task.id);
        
        if (parentTask && currentTask) {
          if (!parentTask.subtasks) {
            parentTask.subtasks = [];
          }

          const existingIndex = parentTask.subtasks.findIndex(st => st.id === task.id);
          if (existingIndex === -1) {
            parentTask.subtasks.push(deepCloneTask(currentTask));
          } else {
            const existingSubtasks = parentTask.subtasks[existingIndex].subtasks || [];
            parentTask.subtasks[existingIndex] = {
              ...deepCloneTask(currentTask),
              subtasks: existingSubtasks,
            };
          }
          
          parentTask.subtasks.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
      }
    });

    const rootTasks = flatTasks
      .filter(task => !task.parentId)
      .map(task => taskMap.get(task.id))
      .filter((task): task is Task => task !== undefined)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

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