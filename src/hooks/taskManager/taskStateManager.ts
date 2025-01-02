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
    console.log('Structuring tasks:', flatTasks);
    
    const taskMap = new Map<number, Task>();
    const rootTasks: Task[] = [];

    // First pass: Create task objects with empty subtasks arrays
    flatTasks.forEach(task => {
      const taskWithSubtasks = { 
        ...task, 
        subtasks: [],
        // 必要なプロパティが欠落している場合のデフォルト値を設定
        order: task.order || 0,
        hierarchyLevel: task.hierarchyLevel || 0,
        completed: task.completed || false,
      };
      taskMap.set(task.id, taskWithSubtasks);
    });

    // Second pass: Build the tree structure
    flatTasks.forEach(task => {
      if (task.parentId) {
        const parentTask = taskMap.get(task.parentId);
        const currentTask = taskMap.get(task.id);
        
        if (parentTask && currentTask) {
          // サブタスクを親タスクのsubtasks配列に追加
          parentTask.subtasks = [...(parentTask.subtasks || []), currentTask];
          
          // サブタスクの順序を保持
          parentTask.subtasks.sort((a, b) => (a.order || 0) - (b.order || 0));
          
          console.log(`Added subtask ${task.id} to parent ${task.parentId}`, parentTask.subtasks);
        }
      } else {
        const rootTask = taskMap.get(task.id);
        if (rootTask) {
          rootTasks.push(rootTask);
        }
      }
    });

    // ルートタスクも順序でソート
    rootTasks.sort((a, b) => (a.order || 0) - (b.order || 0));

    console.log('Structured tasks:', rootTasks);
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