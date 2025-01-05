import { useState } from 'react';
import { Task, Group, DeleteTarget } from "@/types/models";

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

  const calculateTaskLevel = (parentTask: Task | undefined, taskMap: Map<number, Task>): number => {
    if (!parentTask) return 1;
    
    // 親タスクのレベルを取得（存在しない場合は1を返す）
    const parentLevel = parentTask.level || 1;
    
    // 新しいレベルは親のレベル + 1（最大3まで）
    const newLevel = Math.min(parentLevel + 1, 3);
    
    console.log('Calculating task level:', {
      parentTaskId: parentTask.id,
      parentTaskTitle: parentTask.title,
      parentLevel,
      newLevel,
      maxLevel: 3
    });
    
    return newLevel;
  };

  const structureTasks = (flatTasks: Task[]): Task[] => {
    console.log('Structuring tasks input:', flatTasks);
    
    // タスクマップの作成（深いコピーを使用）
    const taskMap = new Map<number, Task>();
    flatTasks.forEach(task => {
      const taskCopy = {
        ...task,
        subtasks: [],
        level: task.level || 1  // レベルが未設定の場合は1をデフォルトとする
      };
      taskMap.set(task.id, taskCopy);
    });

    // 階層構造の構築（レベルの検証と更新を含む）
    flatTasks.forEach(task => {
      if (task.parentId) {
        const parentTask = taskMap.get(task.parentId);
        const currentTask = taskMap.get(task.id);
        
        if (parentTask && currentTask) {
          // 親タスクのsubtasks配列の初期化
          if (!parentTask.subtasks) {
            parentTask.subtasks = [];
          }

          // タスクのレベルを親タスクに基づいて計算
          const calculatedLevel = calculateTaskLevel(parentTask, taskMap);
          
          // レベルの更新が必要な場合のみ更新
          if (currentTask.level !== calculatedLevel) {
            console.log('Updating task level:', {
              taskId: currentTask.id,
              taskTitle: currentTask.title,
              oldLevel: currentTask.level,
              newLevel: calculatedLevel,
              parentTaskId: parentTask.id,
              parentTaskLevel: parentTask.level
            });
            currentTask.level = calculatedLevel;
          }

          // サブタスクの追加（既存のサブタスクを保持）
          const existingIndex = parentTask.subtasks.findIndex(st => st.id === task.id);
          if (existingIndex === -1) {
            parentTask.subtasks.push(currentTask);
          } else {
            // 既存のサブタスクを更新（階層構造を保持）
            const existingSubtasks = parentTask.subtasks[existingIndex].subtasks || [];
            parentTask.subtasks[existingIndex] = {
              ...currentTask,
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
      .map(task => {
        const rootTask = taskMap.get(task.id);
        if (rootTask) {
          // ルートタスクのレベルは1に固定
          rootTask.level = 1;
        }
        return rootTask;
      })
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