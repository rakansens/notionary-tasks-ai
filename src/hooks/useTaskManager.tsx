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

  useEffect(() => {
    const handleTaskAdded = (event: CustomEvent) => {
      const { title, groupId, parentId } = event.detail;
      const task: Task = {
        id: Date.now(),
        title,
        completed: false,
        groupId,
        parentId,
        subtasks: [],
        order: tasks.length,
        addedAt: new Date(),
      };
      setTasks(prevTasks => addTaskToState(prevTasks, task, parentId));

      // タスク追加イベントを発火
      window.dispatchEvent(new CustomEvent('taskActivity', {
        detail: {
          type: 'added',
          task: {
            ...task,
            groupName: groups.find(g => g.id === groupId)?.name,
          },
          timestamp: new Date(),
        }
      }));
    };

    const handleGroupAdded = (event: CustomEvent) => {
      const { title } = event.detail;
      const group: Group = {
        id: Date.now(),
        name: title,
        order: groups.length,
      };
      setGroups(prevGroups => [...prevGroups, group]);

      // グループ追加イベントを発火
      window.dispatchEvent(new CustomEvent('taskActivity', {
        detail: {
          type: 'groupAdded',
          group,
          timestamp: new Date(),
        }
      }));
    };

    window.addEventListener('taskAdded', handleTaskAdded as EventListener);
    window.addEventListener('groupAdded', handleGroupAdded as EventListener);

    return () => {
      window.removeEventListener('taskAdded', handleTaskAdded as EventListener);
      window.removeEventListener('groupAdded', handleGroupAdded as EventListener);
    };
  }, [tasks.length, groups.length]);

  const toggleTask = (id: number, parentId?: number) => {
    setTasks(prevTasks => {
      const updatedTasks = toggleTaskInState(prevTasks, id, parentId);
      
      // タスク完了状態変更イベントを発火
      const task = updatedTasks.find(t => t.id === id);
      if (task) {
        window.dispatchEvent(new CustomEvent('taskActivity', {
          detail: {
            type: 'toggled',
            task: {
              ...task,
              groupName: groups.find(g => g.id === task.groupId)?.name,
            },
            timestamp: new Date(),
          }
        }));
      }
      
      return updatedTasks;
    });
  };

  const deleteTask = (id: number, parentId?: number) => {
    // 削除前にタスク情報を保存
    const taskToDelete = tasks.find(t => t.id === id);
    
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

    // タスク削除イベントを発火
    if (taskToDelete) {
      window.dispatchEvent(new CustomEvent('taskActivity', {
        detail: {
          type: 'deleted',
          task: {
            ...taskToDelete,
            groupName: groups.find(g => g.id === taskToDelete.groupId)?.name,
          },
          timestamp: new Date(),
        }
      }));
    }
  };

  const deleteGroup = (id: number) => {
    // 削除前にグループ情報を保存
    const groupToDelete = groups.find(g => g.id === id);
    
    setDeleteTarget({ type: "group", id });

    // グループ削除イベントを発火
    if (groupToDelete) {
      window.dispatchEvent(new CustomEvent('taskActivity', {
        detail: {
          type: 'groupDeleted',
          group: groupToDelete,
          timestamp: new Date(),
        }
      }));
    }
  };

  const updateTaskTitle = (id: number, title: string, parentId?: number) => {
    setTasks(prevTasks => updateTaskTitleInState(prevTasks, id, title, parentId));
  };

  const updateTaskOrder = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
  };

  const updateGroupOrder = (updatedGroups: Group[]) => {
    setGroups(updatedGroups);
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

    // タスク追加イベントを発火
    window.dispatchEvent(new CustomEvent('taskActivity', {
      detail: {
        type: 'added',
        task: {
          ...task,
          groupName: groups.find(g => g.id === groupId)?.name,
        },
        timestamp: new Date(),
      }
    }));
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
