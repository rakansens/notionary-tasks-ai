import { TaskNode, TaskValidationResult } from '../types/taskTypes';

export const MAX_DEPTH = 3;

export const buildTaskTree = (tasks: TaskNode[]): TaskNode[] => {
  const taskMap = new Map<number, TaskNode>();
  const rootTasks: TaskNode[] = [];

  // First pass: Create map of all tasks
  tasks.forEach(task => {
    taskMap.set(task.id, { ...task, children: [] });
  });

  // Second pass: Build tree structure
  tasks.forEach(task => {
    const node = taskMap.get(task.id);
    if (!node) return;

    if (task.parentId) {
      const parent = taskMap.get(task.parentId);
      if (parent) {
        parent.children.push(node);
        node.depth = parent.depth + 1;
      }
    } else {
      rootTasks.push(node);
      node.depth = 1;
    }
  });

  return rootTasks;
};

export const validateTaskMove = (
  sourceTask: TaskNode,
  targetParentId: number | null,
  tasks: TaskNode[]
): TaskValidationResult => {
  // Check for maximum depth
  if (targetParentId) {
    const targetParent = tasks.find(t => t.id === targetParentId);
    if (targetParent) {
      const newDepth = targetParent.depth + 1;
      if (newDepth > MAX_DEPTH) {
        return {
          isValid: false,
          error: `タスクは${MAX_DEPTH}階層までしか移動できません`
        };
      }
    }
  }

  // Check for circular reference
  const wouldCreateCycle = checkForCyclicDependency(
    sourceTask.id,
    targetParentId,
    tasks
  );
  if (wouldCreateCycle) {
    return {
      isValid: false,
      error: '循環参照は許可されていません'
    };
  }

  return { isValid: true };
};

const checkForCyclicDependency = (
  sourceId: number,
  targetParentId: number | null,
  tasks: TaskNode[]
): boolean => {
  if (!targetParentId) return false;
  if (sourceId === targetParentId) return true;

  const visited = new Set<number>();
  const checkCycle = (currentId: number): boolean => {
    if (visited.has(currentId)) return false;
    visited.add(currentId);

    const currentTask = tasks.find(t => t.id === currentId);
    if (!currentTask?.parentId) return false;

    return currentTask.parentId === sourceId || checkCycle(currentTask.parentId);
  };

  return checkCycle(targetParentId);
};