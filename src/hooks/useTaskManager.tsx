import { useState } from "react";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  groupId?: number;
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
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "task" | "group";
    id: number;
  } | null>(null);

  const addTask = (groupId?: number) => {
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now(),
      title: newTask,
      completed: false,
      groupId,
    };
    
    setTasks([...tasks, task]);
    setNewTask("");
  };

  const addGroup = () => {
    if (!newGroup.trim()) return;
    
    const group: Group = {
      id: Date.now(),
      name: newGroup,
    };
    
    setGroups([...groups, group]);
    setNewGroup("");
    setIsAddingGroup(false);
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const updateTaskTitle = (id: number, newTitle: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, title: newTitle } : task
    ));
    setEditingTaskId(null);
  };

  const deleteTask = (id: number) => {
    setDeleteTarget({ type: "task", id });
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

  const updateGroupName = (id: number, newName: string) => {
    if (!newName.trim()) return;
    
    setGroups(groups.map(group =>
      group.id === id ? { ...group, name: newName } : group
    ));
    setEditingGroupId(null);
  };

  return {
    tasks,
    groups,
    newTask,
    newGroup,
    isAddingGroup,
    editingTaskId,
    editingGroupId,
    deleteTarget,
    setNewTask,
    setNewGroup,
    setIsAddingGroup,
    setEditingTaskId,
    setEditingGroupId,
    addTask,
    addGroup,
    toggleTask,
    updateTaskTitle,
    updateGroupName,
    deleteTask,
    deleteGroup,
    confirmDelete,
    cancelDelete,
  };
};
