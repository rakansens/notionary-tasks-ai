import { useState } from 'react';
import { Task, Group, DeleteTarget } from "@/types/models";
import { normalizeTaskData, calculateTaskLevel } from "@/utils/taskUtils";

export const useTaskStateManager = () => {
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
    console.log('Structuring tasks input:', flatTasks);
    
    const taskMap = new Map<number, Task>();
    const rootTasks: Task[] = [];

    // タスクの正規化とマップの作成
    flatTasks.forEach(task => {
      const normalizedTask = normalizeTaskData(task);
      taskMap.set(task.id, { ...normalizedTask, subtasks: [] });
    });

    // 親子関係の構築
    flatTasks.forEach(task => {
      const currentTask = taskMap.get(task.id);
      if (!currentTask) return;

      if (task.parentId) {
        const parentTask = taskMap.get(task.parentId);
        if (parentTask) {
          // レベルの計算と更新
          currentTask.level = calculateTaskLevel(currentTask, parentTask);
          
          // サブタスクの追加
          parentTask.subtasks = parentTask.subtasks || [];
          parentTask.subtasks.push(currentTask);
          
          // サブタスクを順序でソート
          parentTask.subtasks.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
      } else {
        rootTasks.push(currentTask);
      }
    });

    // ルートタスクを順序でソート
    rootTasks.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    console.log('Structured tasks output:', rootTasks);
    return rootTasks;
  };

  const setStructuredTasks = (tasksOrUpdater: Task[] | ((prev: Task[]) => Task[])) => {
    if (typeof tasksOrUpdater === 'function') {
      setTasks(prev => {
        const updatedTasks = tasksOrUpdater(prev);
        console.log('Updating tasks with function:', updatedTasks);
        return structureTasks(updatedTasks);
      });
    } else {
      console.log('Setting tasks directly:', tasksOrUpdater);
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