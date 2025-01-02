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
    
    // 最初のパスでタスクマップを作成
    const taskMap = new Map<number, Task>();
    
    // 深いコピーを作成する関数
    const deepCopyTask = (task: Task): Task => {
      return {
        ...task,
        subtasks: task.subtasks ? [...task.subtasks] : [],
      };
    };

    // すべてのタスクをマップに追加（深いコピーを使用）
    flatTasks.forEach(task => {
      if (!taskMap.has(task.id)) {
        taskMap.set(task.id, deepCopyTask(task));
      }
    });

    // 階層構造を構築（親子関係を設定）
    flatTasks.forEach(task => {
      if (task.parentId) {
        const parentTask = taskMap.get(task.parentId);
        const currentTask = taskMap.get(task.id);
        
        if (parentTask && currentTask) {
          // 親タスクのsubtasks配列が存在しない場合は初期化
          if (!parentTask.subtasks) {
            parentTask.subtasks = [];
          }

          // 重複チェック
          const existingIndex = parentTask.subtasks.findIndex(st => st.id === task.id);
          
          if (existingIndex === -1) {
            // サブタスクが存在しない場合は追加
            parentTask.subtasks.push(currentTask);
          } else {
            // 既存のサブタスクを更新（サブタスクの階層構造を保持）
            parentTask.subtasks[existingIndex] = {
              ...currentTask,
              subtasks: parentTask.subtasks[existingIndex].subtasks || [],
            };
          }
          
          // サブタスクを順序でソート
          parentTask.subtasks.sort((a, b) => (a.order || 0) - (b.order || 0));
          
          console.log(`Updated subtasks for parent ${task.parentId}:`, parentTask.subtasks);
        }
      }
    });

    // ルートタスク（親を持たないタスク）を収集
    const rootTasks = flatTasks
      .filter(task => !task.parentId)
      .map(task => taskMap.get(task.id))
      .filter((task): task is Task => task !== undefined);

    // ルートタスクを順序でソート
    const sortedRootTasks = rootTasks.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    console.log('Structured tasks output:', sortedRootTasks);
    return sortedRootTasks;
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