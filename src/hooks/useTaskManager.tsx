import { useState } from "react";
import { Task, Group, DeleteTarget } from './taskManager/types';
import {
  addTaskToState,
  toggleTaskInState,
  updateTaskTitleInState,
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
    setTasks(prevTasks => {
      const taskToMove = prevTasks.find(t => t.id === taskId);
      if (!taskToMove) return prevTasks;

      // サブタスクの場合は親タスク内での並び替えのみ
      if (taskToMove.parentId) {
        const parentTask = prevTasks.find(t => t.id === taskToMove.parentId);
        if (!parentTask || !parentTask.subtasks) return prevTasks;

        const updatedSubtasks = [...parentTask.subtasks];
        const oldIndex = updatedSubtasks.findIndex(t => t.id === taskId);
        if (oldIndex === -1) return prevTasks;

        const [removed] = updatedSubtasks.splice(oldIndex, 1);
        const targetIndex = typeof newIndex === 'number' ? newIndex : updatedSubtasks.length;
        updatedSubtasks.splice(targetIndex, 0, removed);

        return prevTasks.map(task =>
          task.id === parentTask.id
            ? { ...task, subtasks: updatedSubtasks }
            : task
        );
      }

      // メインタスクの移動
      const updatedTask = {
        ...taskToMove,
        groupId: newGroupId ?? taskToMove.groupId,
      };

      // 現在のタスクの位置を取得
      const currentIndex = prevTasks.findIndex(t => t.id === taskId);
      
      // 移動先のグループ内のタスクを取得（現在のタスクを除く）
      const tasksInTargetGroup = prevTasks.filter(t => 
        t.groupId === updatedTask.groupId && !t.parentId && t.id !== taskId
      );

      // グループ外のタスクを取得
      const tasksOutsideGroup = prevTasks.filter(t => 
        (t.groupId !== updatedTask.groupId || t.parentId) && t.id !== taskId
      );

      // 移動先のインデックスを計算
      let targetIndex = typeof newIndex === 'number' ? newIndex : tasksInTargetGroup.length;

      // 下から上への移動の場合のインデックス調整
      if (currentIndex !== -1 && targetIndex > currentIndex) {
        targetIndex--;
      }

      // タスクを新しい位置に挿入
      const beforeTasks = tasksInTargetGroup.slice(0, targetIndex);
      const afterTasks = tasksInTargetGroup.slice(targetIndex);

      // 最終的なタスクリストを構築
      const updatedTasks = [
        ...tasksOutsideGroup,
        ...beforeTasks,
        updatedTask,
        ...afterTasks,
      ];

      console.log('Updated tasks:', updatedTasks);
      return updatedTasks;
    });
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
