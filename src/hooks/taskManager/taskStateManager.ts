import { useState } from 'react';
import { Task, Group, DeleteTarget } from './types';

export const useTaskStateManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [addingSubtaskId, setAddingSubtaskId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set());

  const structureTasks = (flatTasks: Task[]): Task[] => {
    console.log('Structuring tasks input:', flatTasks);
    
    // First pass: Create task objects with their existing subtasks
    const taskMap = new Map<number, Task>();
    
    // 最初のパスで全てのタスクをマップに追加
    flatTasks.forEach(task => {
      const existingTask = taskMap.get(task.id);
      const taskCopy = { 
        ...task,
        // 既存のタスクのサブタスクを保持、または新しい配列を作成
        subtasks: existingTask?.subtasks || []
      };
      taskMap.set(task.id, taskCopy);
    });

    // Second pass: Build the tree structure
    const rootTasks: Task[] = [];
    
    flatTasks.forEach(task => {
      const currentTask = taskMap.get(task.id);
      if (!currentTask) return;

      if (task.parentId) {
        const parentTask = taskMap.get(task.parentId);
        if (parentTask) {
          // サブタスクの重複チェック
          const existingSubtaskIndex = parentTask.subtasks.findIndex(
            st => st.id === task.id
          );
          
          if (existingSubtaskIndex === -1) {
            // 存在しない場合のみ追加
            parentTask.subtasks.push(currentTask);
          } else {
            // 既存のサブタスクを更新（サブタスクの階層構造を保持）
            parentTask.subtasks[existingSubtaskIndex] = {
              ...currentTask,
              subtasks: parentTask.subtasks[existingSubtaskIndex].subtasks || []
            };
          }
          
          // サブタスクを順序でソート
          parentTask.subtasks.sort((a, b) => (a.order || 0) - (b.order || 0));
          
          console.log(`Updated subtasks for parent ${task.parentId}:`, parentTask.subtasks);
        }
      } else {
        // ルートタスクの場合、重複チェック
        if (!rootTasks.some(rt => rt.id === task.id)) {
          rootTasks.push(currentTask);
        }
      }
    });

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