import { useState } from "react";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  groupId?: number;
  parentId?: number;
  subtasks?: Task[];
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

  const updateGroupName = (id: number, newName: string) => {
    setGroups(groups.map(group =>
      group.id === id ? { ...group, name: newName } : group
    ));
  };

  const addTask = (groupId?: number, parentId?: number) => {
    if (!newTask.trim()) return;
    
    const newTaskId = Date.now();
    const task: Task = {
      id: newTaskId,
      title: newTask,
      completed: false,
      groupId,
      parentId,
      subtasks: [],
    };
    
    setTasks(prevTasks => {
      if (parentId) {
        // サブタスクを追加する場合
        return prevTasks.map(t => {
          if (t.id === parentId) {
            return {
              ...t,
              subtasks: [...(t.subtasks || []), task],
            };
          }
          return t;
        });
      }
      // メインタスクを追加する場合
      return [...prevTasks, task];
    });
    
    setNewTask("");
    // 新しいタスクを追加した後、そのタスクを編集モードにする
    setEditingTaskId(newTaskId);
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

  const toggleTask = (id: number, parentId?: number) => {
    setTasks(prevTasks => {
      if (parentId) {
        return prevTasks.map(task => {
          if (task.id === parentId) {
            return {
              ...task,
              subtasks: task.subtasks?.map(subtask =>
                subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
              ),
            };
          }
          return task;
        });
      }
      return prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
    });
  };

  const updateTaskTitle = (id: number, newTitle: string, parentId?: number) => {
    setTasks(prevTasks => {
      if (parentId) {
        return prevTasks.map(task => {
          if (task.id === parentId) {
            return {
              ...task,
              subtasks: task.subtasks?.map(subtask =>
                subtask.id === id ? { ...subtask, title: newTitle } : subtask
              ),
            };
          }
          return task;
        });
      }
      return prevTasks.map(task =>
        task.id === id ? { ...task, title: newTitle } : task
      );
    });
    setEditingTaskId(null);
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
