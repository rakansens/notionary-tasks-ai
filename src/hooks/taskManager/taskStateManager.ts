import { useState } from 'react';
import { Task, Group, DeleteTarget } from './types';

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
    
    // 深いコピーを作成する関数（再帰的に全ての階層をコピー）
    const deepCloneTask = (task: Task): Task => ({
      ...task,
      subtasks: task.subtasks?.map(subtask => deepCloneTask(subtask)) || [],
    });
    
    // タスクマップの作成（深いコピーを使用）
    const taskMap = new Map<number, Task>();
    flatTasks.forEach(task => {
      if (!taskMap.has(task.id)) {
        taskMap.set(task.id, deepCloneTask(task));
      }
    });

    // 階層構造の構築
    flatTasks.forEach(task => {
      if (task.parentId) {
        const parentTask = taskMap.get(task.parentId);
        const currentTask = taskMap.get(task.id);
        
        if (parentTask && currentTask) {
          // 親タスクのsubtasks配列の初期化
          if (!parentTask.subtasks) {
            parentTask.subtasks = [];
          }

          // 既存のサブタスクを保持しながら更新
          const existingIndex = parentTask.subtasks.findIndex(st => st.id === task.id);
          if (existingIndex === -1) {
            // 新しいサブタスクを追加
            parentTask.subtasks.push(deepCloneTask(currentTask));
          } else {
            // 既存のサブタスクを更新（階層構造を保持）
            const existingSubtasks = parentTask.subtasks[existingIndex].subtasks || [];
            parentTask.subtasks[existingIndex] = {
              ...deepCloneTask(currentTask),
              subtasks: existingSubtasks,
            };
          }
          
          // サブタスクを順序でソート
          parentTask.subtasks.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
      }
    });

    // ルートタスクの収集と順序付け
    const rootTasks = flatTasks
      .filter(task => !task.parentId)
      .map(task => taskMap.get(task.id))
      .filter((task): task is Task => task !== undefined)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

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