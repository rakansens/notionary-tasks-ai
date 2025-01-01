import { useState, useEffect } from "react";
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

  const dispatchTaskEvent = (eventName: string, detail: any) => {
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: {
        ...detail,
        timestamp: new Date(),
      },
      bubbles: true,
      composed: true
    }));
  };

  const toggleTask = (id: number, parentId?: number) => {
    setTasks(prevTasks => toggleTaskInState(prevTasks, id, parentId));
    const task = tasks.find(t => t.id === id);
    if (task) {
      dispatchTaskEvent('taskCompleted', {
        type: parentId ? 'subtask_toggled' : 'task_toggled',
        title: task.title,
        completed: !task.completed,
      });
    }
  };

  const updateTaskTitle = (id: number, title: string, parentId?: number) => {
    setTasks(prevTasks => updateTaskTitleInState(prevTasks, id, title, parentId));
    const task = tasks.find(t => t.id === id);
    if (task) {
      dispatchTaskEvent('taskCompleted', {
        type: parentId ? 'subtask_updated' : 'task_updated',
        title: title,
        oldTitle: task.title,
      });
    }
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

    // タスク追加イベントの発火
    if (parentId) {
      const parentTask = tasks.find(t => t.id === parentId);
      dispatchTaskEvent('taskCompleted', {
        type: 'subtask_added',
        title: task.title,
        parentTaskTitle: parentTask?.title,
      });
    } else if (groupId) {
      const group = groups.find(g => g.id === groupId);
      dispatchTaskEvent('taskCompleted', {
        type: 'group_task_added',
        title: task.title,
        groupName: group?.name,
      });
    } else {
      dispatchTaskEvent('taskCompleted', {
        type: 'task_added',
        title: task.title,
      });
    }
  };

  const deleteTask = (id: number, parentId?: number) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    if (parentId) {
      const parentTask = tasks.find(t => t.id === parentId);
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
      dispatchTaskEvent('taskCompleted', {
        type: 'subtask_deleted',
        title: taskToDelete.title,
        parentTaskTitle: parentTask?.title,
      });
    } else {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      if (taskToDelete.groupId) {
        const group = groups.find(g => g.id === taskToDelete.groupId);
        dispatchTaskEvent('taskCompleted', {
          type: 'group_task_deleted',
          title: taskToDelete.title,
          groupName: group?.name,
        });
      } else {
        dispatchTaskEvent('taskCompleted', {
          type: 'task_deleted',
          title: taskToDelete.title,
        });
      }
    }
  };

  const addGroup = () => {
    if (!newGroup.trim()) return;
    
    const group: Group = {
      id: Date.now(),
      name: newGroup,
      order: groups.length,
    };
    
    setGroups(prevGroups => [...prevGroups, group]);
    setNewGroup("");
    setIsAddingGroup(false);

    dispatchTaskEvent('taskCompleted', {
      type: 'group_added',
      title: group.name,
    });
  };

  const deleteGroup = (id: number) => {
    const groupToDelete = groups.find(g => g.id === id);
    if (groupToDelete) {
      dispatchTaskEvent('taskCompleted', {
        type: 'group_deleted',
        title: groupToDelete.name,
      });
    }
    setDeleteTarget({ type: "group", id });
  };

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

  const updateTaskOrder = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
  };

  const updateGroupOrder = (updatedGroups: Group[]) => {
    setGroups(updatedGroups);
  };

  const updateGroupName = (id: number, name: string) => {
    setGroups(prevGroups => updateGroupNameInState(prevGroups, id, name));
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
    updateGroupOrder,
    toggleGroupCollapse,
  };
};
