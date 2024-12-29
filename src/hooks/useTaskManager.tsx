import { useState } from "react";
import { Task, Group, DeleteTarget } from './taskManager/types';
import {
  addTaskToState,
  toggleTaskInState,
  updateTaskTitleInState,
  updateTaskOrderInState,
} from './taskManager/taskOperations';

export type { Task, Group };

export const useTaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [addingSubtaskId, setAddingSubtaskId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const addTask = (groupId?: number, parentId?: number) => {
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now(),
      title: newTask,
      completed: false,
      groupId,
      parentId,
      subtasks: [],
      order: tasks.length,
    };
    
    setTasks(prevTasks => addTaskToState(prevTasks, task, parentId));
    setNewTask("");
  };

  const addGroup = () => {
    if (!newGroup.trim()) return;
    
    const group: Group = {
      id: Date.now(),
      name: newGroup,
    };
    
    setGroups(prevGroups => [...prevGroups, group]);
    setNewGroup("");
    setIsAddingGroup(false);
  };

  const toggleTask = (id: number, parentId?: number) => {
    setTasks(prevTasks => toggleTaskInState(prevTasks, id, parentId));
  };

  const updateTaskTitle = (id: number, title: string, parentId?: number) => {
    setTasks(prevTasks => updateTaskTitleInState(prevTasks, id, title, parentId));
  };

  const updateTaskOrder = (taskId: number, newGroupId?: number, newIndex?: number) => {
    setTasks(prevTasks => updateTaskOrderInState(prevTasks, taskId, newGroupId, newIndex));
  };

  const updateGroupName = (id: number, newName: string) => {
    setGroups(groups.map(group =>
      group.id === id ? { ...group, name: newName } : group
    ));
  };

  const deleteTask = (id: number, parentId?: number) => {
    if (parentId) {
      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.id === parentId) {
            return {
              ...task,
              subtasks: task.subtasks?.filter(subtask => subtask.id !== id),
            };
          }
          return task;
        })
      );
    } else {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }
  };

  const deleteGroup = (id: number) => {
    setDeleteTarget({ type: "group", id });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "task") {
      setTasks(tasks.filter(task => task.id !== deleteTarget.id));
    } else {
      setGroups(groups.filter(group => group.id !== deleteTarget.id));
      setTasks(tasks.filter(task => task.groupId !== deleteTarget.id));
    }
    
    setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  return {
    tasks,
    groups,
    newTask,
    newGroup,
    isAddingGroup,
    editingTaskId,
    editingGroupId,
    addingSubtaskId,
    deleteTarget,
    setNewTask,
    setNewGroup,
    setIsAddingGroup,
    setEditingTaskId,
    setEditingGroupId,
    setAddingSubtaskId,
    addTask,
    addGroup,
    toggleTask,
    updateTaskTitle,
    updateGroupName,
    deleteTask,
    deleteGroup,
    confirmDelete,
    cancelDelete,
    updateTaskOrder,
  };
};