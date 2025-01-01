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
import { emitTaskEvent, createTaskEvent } from '@/utils/taskEventEmitter';

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

      // タスク追加時のログ記録を追加
      const parentTask = parentId ? tasks.find(t => t.id === parentId) : undefined;
      const group = groupId ? groups.find(g => g.id === groupId) : undefined;
      
      emitTaskEvent(createTaskEvent(
        parentId ? 'SUBTASK_ADDED' : groupId ? 'GROUP_TASK_ADDED' : 'TASK_ADDED',
        title,
        parentTask?.title,
        group?.name
      ));

      setTasks(prevTasks => addTaskToState(prevTasks, task, parentId));
    };

    const handleGroupAdded = (event: CustomEvent) => {
      const { title } = event.detail;
      const group: Group = {
        id: Date.now(),
        name: title,
        order: groups.length,
      };
      setGroups(prevGroups => [...prevGroups, group]);
    };

    window.addEventListener('taskAdded', handleTaskAdded as EventListener);
    window.addEventListener('groupAdded', handleGroupAdded as EventListener);

    return () => {
      window.removeEventListener('taskAdded', handleTaskAdded as EventListener);
      window.removeEventListener('groupAdded', handleGroupAdded as EventListener);
    };
  }, [tasks.length, groups.length]);

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

    // タスク追加時のログ記録
    const parentTask = parentId ? tasks.find(t => t.id === parentId) : undefined;
    const group = groupId ? groups.find(g => g.id === groupId) : undefined;
    
    emitTaskEvent(createTaskEvent(
      parentId ? 'SUBTASK_ADDED' : groupId ? 'GROUP_TASK_ADDED' : 'TASK_ADDED',
      task.title,
      parentTask?.title,
      group?.name
    ));

    setTasks(prevTasks => addTaskToState(prevTasks, task, parentId));
    setNewTask("");
    setEditingTaskId(task.id);
  };

  const updateTaskTitle = (id: number, title: string, parentId?: number) => {
    if (title.trim() !== "") {
      const task = tasks.find(t => t.id === id);
      if (task) {
        const parentTask = parentId ? tasks.find(t => t.id === parentId) : undefined;
        const group = task.groupId ? groups.find(g => g.id === task.groupId) : undefined;

        emitTaskEvent(createTaskEvent(
          parentId ? 'SUBTASK_ADDED' : task.groupId ? 'GROUP_TASK_ADDED' : 'TASK_ADDED',
          title,
          parentTask?.title,
          group?.name
        ));
      }
    }
    setTasks(prevTasks => updateTaskTitleInState(prevTasks, id, title, parentId));
    setEditingTaskId(null);
  };

  const toggleTask = (id: number, parentId?: number) => {
    const taskToToggle = tasks.find(t => t.id === id);
    if (taskToToggle) {
      const parentTask = parentId ? tasks.find(t => t.id === parentId) : undefined;
      const group = taskToToggle.groupId ? groups.find(g => g.id === taskToToggle.groupId) : undefined;
      const location = group ? `グループ「${group.name}」内の` : '';
      const relation = parentTask ? `サブタスク「${taskToToggle.title}」` : `タスク「${taskToToggle.title}」`;
      const message = `${location}${relation}を${!taskToToggle.completed ? '完了' : '未完了'}に変更しました`;

      emitTaskEvent(createTaskEvent(
        'TASK_COMPLETED',
        taskToToggle.title,
        parentTask?.title,
        group?.name,
        message
      ));
    }
    setTasks(prevTasks => toggleTaskInState(prevTasks, id, parentId));
  };

  const deleteTask = (id: number, parentId?: number) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    const parentTask = parentId ? tasks.find(t => t.id === parentId) : undefined;
    const group = taskToDelete.groupId ? groups.find(g => g.id === taskToDelete.groupId) : undefined;

    emitTaskEvent(createTaskEvent(
      parentId ? 'SUBTASK_DELETED' : taskToDelete.groupId ? 'GROUP_TASK_DELETED' : 'TASK_DELETED',
      taskToDelete.title,
      parentTask?.title,
      group?.name
    ));

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

  const addGroup = () => {
    if (!newGroup.trim()) return;
    
    const group: Group = {
      id: Date.now(),
      name: newGroup,
      order: groups.length,
    };
    
    emitTaskEvent(createTaskEvent('GROUP_ADDED', group.name));
    
    setGroups(prevGroups => [...prevGroups, group]);
    setNewGroup("");
    setIsAddingGroup(false);
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

  const deleteGroup = (id: number) => {
    const groupToDelete = groups.find(g => g.id === id);
    if (groupToDelete) {
      emitTaskEvent(createTaskEvent('GROUP_DELETED', groupToDelete.name));
    }
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
    updateGroupOrder,
    toggleGroupCollapse,
  };
};
