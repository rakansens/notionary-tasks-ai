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
    
    const taskMap = new Map<number, Task>();
    const rootTasks: Task[] = [];

    // First pass: Create task objects with empty subtasks arrays
    flatTasks.forEach(task => {
      const taskWithSubtasks = { 
        ...task, 
        subtasks: [],
        order: task.order || 0,
        hierarchyLevel: task.hierarchyLevel || 0,
        completed: task.completed || false,
      };
      taskMap.set(task.id, taskWithSubtasks);
    });

    // Second pass: Build the tree structure
    flatTasks.forEach(task => {
      const currentTask = taskMap.get(task.id);
      if (!currentTask) return;

      if (task.parentId) {
        const parentTask = taskMap.get(task.parentId);
        if (parentTask) {
          // 既存のサブタスクを保持しながら新しいサブタスクを追加
          const existingSubtasks = parentTask.subtasks || [];
          const updatedSubtasks = [...existingSubtasks];
          
          // 現在のタスクが既に存在するか確認
          const existingIndex = updatedSubtasks.findIndex(st => st.id === currentTask.id);
          if (existingIndex === -1) {
            // 存在しない場合のみ追加
            updatedSubtasks.push(currentTask);
          } else {
            // 存在する場合は更新
            updatedSubtasks[existingIndex] = currentTask;
          }
          
          // サブタスクの順序でソート
          parentTask.subtasks = updatedSubtasks.sort((a, b) => (a.order || 0) - (b.order || 0));
          
          console.log(`Updated subtasks for parent ${task.parentId}:`, parentTask.subtasks);
        }
      } else {
        if (!rootTasks.some(rt => rt.id === currentTask.id)) {
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