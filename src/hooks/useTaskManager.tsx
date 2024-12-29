import { useState } from "react";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  groupId?: number;
  parentId?: number;
  subtasks?: Task[];
  order?: number;
}

export interface Group {
  id: number;
  name: string;
}

export const useTaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [addingSubtaskId, setAddingSubtaskId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "task" | "group";
    id: number;
  } | null>(null);

  // Task management functions
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
    
    setTasks(prevTasks => {
      if (parentId) {
        return prevTasks.map(t => 
          t.id === parentId 
            ? { ...t, subtasks: [...(t.subtasks || []), task] }
            : t
        );
      }
      return [...prevTasks, task];
    });
    
    setNewTask("");
  };

  const updateTaskOrder = (taskId: number, newGroupId?: number, newIndex?: number) => {
    setTasks(prevTasks => {
      const taskToMove = prevTasks.find(t => t.id === taskId);
      if (!taskToMove) return prevTasks;

      // Remove task from current position
      const remainingTasks = prevTasks.filter(t => t.id !== taskId);
      
      // Prepare updated task
      const updatedTask = {
        ...taskToMove,
        groupId: newGroupId ?? taskToMove.groupId,
      };

      // Insert task at new position
      if (typeof newIndex === 'number') {
        const tasksInTargetGroup = remainingTasks.filter(t => t.groupId === newGroupId);
        const beforeTasks = tasksInTargetGroup.slice(0, newIndex);
        const afterTasks = tasksInTargetGroup.slice(newIndex);
        
        return [
          ...remainingTasks.filter(t => t.groupId !== newGroupId),
          ...beforeTasks,
          updatedTask,
          ...afterTasks,
        ];
      }

      return [...remainingTasks, updatedTask];
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
    updateTaskOrder,
    updateGroupName,
    deleteTask,
    deleteGroup,
    confirmDelete,
    cancelDelete,
  };
};
