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
    
    // First pass: Create task objects and maintain existing subtasks
    const taskMap = new Map<number, Task>();
    
    // まず、既存のタスクの状態を保持
    flatTasks.forEach(task => {
      const existingTask = taskMap.get(task.id);
      if (existingTask) {
        // 既存のタスクがある場合は、そのsubtasksを保持
        taskMap.set(task.id, {
          ...task,
          subtasks: existingTask.subtasks || [],
          order: task.order || 0,
          hierarchyLevel: task.hierarchyLevel || 0,
          completed: task.completed || false,
        });
      } else {
        // 新しいタスクの場合
        taskMap.set(task.id, {
          ...task,
          subtasks: task.subtasks || [], // 既存のsubtasksがあれば保持
          order: task.order || 0,
          hierarchyLevel: task.hierarchyLevel || 0,
          completed: task.completed || false,
        });
      }
    });

    // Second pass: Build the tree structure
    const rootTasks: Task[] = [];
    
    flatTasks.forEach(task => {
      const currentTask = taskMap.get(task.id);
      if (!currentTask) return;

      if (task.parentId) {
        const parentTask = taskMap.get(task.parentId);
        if (parentTask) {
          // 親タスクのサブタスク配列を取得
          const existingSubtasks = parentTask.subtasks || [];
          
          // 現在のタスクが既に親タスクのサブタスクとして存在するか確認
          const existingIndex = existingSubtasks.findIndex(st => st.id === task.id);
          
          if (existingIndex === -1) {
            // 存在しない場合は追加（既存のsubtasksを保持）
            parentTask.subtasks = [
              ...existingSubtasks,
              {
                ...currentTask,
                subtasks: currentTask.subtasks || [], // 既存のsubtasksを保持
              }
            ];
          } else {
            // 存在する場合は更新（既存のsubtasksを保持）
            const updatedSubtasks = [...existingSubtasks];
            updatedSubtasks[existingIndex] = {
              ...currentTask,
              subtasks: existingSubtasks[existingIndex].subtasks || [],
            };
            parentTask.subtasks = updatedSubtasks;
          }
          
          // サブタスクを順序でソート
          parentTask.subtasks.sort((a, b) => (a.order || 0) - (b.order || 0));
          
          console.log(`Updated subtasks for parent ${task.parentId}:`, parentTask.subtasks);
        }
      } else {
        // ルートタスクの場合（既存のsubtasksを保持）
        if (!rootTasks.some(rt => rt.id === task.id)) {
          rootTasks.push({
            ...currentTask,
            subtasks: currentTask.subtasks || [],
          });
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