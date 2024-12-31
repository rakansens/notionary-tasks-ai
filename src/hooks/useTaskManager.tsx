import { useState } from "react";
import { Task, Group, DeleteTarget } from './taskManager/types';
import {
  addTaskToState,
  toggleTaskInState,
  updateTaskTitleInState,
  updateTaskOrderInState,
} from './taskManager/taskOperations';
import {
  addGroupToState,
  updateGroupNameInState,
  deleteGroupFromState,
  cleanupTasksAfterGroupDelete,
} from './taskManager/groupOperations';

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
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set());

  const toggleGroupCollapse = (groupId: number) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const addTask = (groupId?: number, parentId?: number) => {
    const task: Task = {
      id: Date.now(),
      title: newTask || "新しいタスク",
      completed: false,
      groupId,
      parentId,
      subtasks: [],
      order: tasks.length,
      addedAt: new Date(),
    };
    
    setTasks(prevTasks => addTaskToState(prevTasks, task, parentId));
    setNewTask("");
    setEditingTaskId(task.id);
  };

  const addGroup = () => {
    if (!newGroup.trim()) return;
    
    const group: Group = {
      id: Date.now(),
      name: newGroup,
    };
    
    setGroups(prevGroups => addGroupToState(prevGroups, group));

    const taskId = Date.now() + 1;
    const task: Task = {
      id: taskId,
      title: newTask || "新しいタスク",
      completed: false,
      groupId: group.id,
      subtasks: [],
      order: tasks.length,
      addedAt: new Date(),
    };
    
    setTasks(prevTasks => addTaskToState(prevTasks, task));
    setNewGroup("");
    setNewTask("");
    setIsAddingGroup(false);
    setEditingTaskId(taskId);
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

  const updateGroupName = (id: number, name: string) => {
    setGroups(prevGroups => updateGroupNameInState(prevGroups, id, name));
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
      setGroups(prevGroups => deleteGroupFromState(prevGroups, deleteTarget.id));
      setTasks(prevTasks => cleanupTasksAfterGroupDelete(prevTasks, deleteTarget.id));
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
    collapsedGroups,
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
    toggleGroupCollapse,
  };
};