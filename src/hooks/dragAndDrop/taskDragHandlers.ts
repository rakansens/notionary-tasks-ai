import { Task } from "../taskManager/types";
import type { UpdateTaskOrderFn } from "./types";

const preserveSubtasks = (tasks: Task[], updatedTasks: Task[]): Task[] => {
  const taskMap = new Map(tasks.map(task => [task.id, task]));
  
  return updatedTasks.map(task => {
    const originalTask = taskMap.get(task.id);
    if (originalTask?.subtasks) {
      return { ...task, subtasks: originalTask.subtasks };
    }
    return task;
  });
};

export const handleTaskDragEnd = (
  activeId: string,
  overId: string,
  tasks: Task[],
  updateTaskOrder: UpdateTaskOrderFn
) => {
  console.log('handleTaskDragEnd:', { activeId, overId });
  
  const activeTaskId = Number(activeId);
  const overTaskId = overId.startsWith('group-') ? undefined : Number(overId);
  const overGroupId = overId.startsWith('group-') ? Number(overId.replace('group-', '')) : undefined;

  const activeTask = tasks.find(task => task.id === activeTaskId);
  const overTask = overTaskId ? tasks.find(task => task.id === overTaskId) : undefined;
  
  if (!activeTask) return;

  const updatedTasks = [...tasks];
  const taskToMove = { ...activeTask };
  const filteredTasks = updatedTasks.filter(t => t.id !== activeTaskId);

  // グループ関連の移動を処理
  if (overGroupId !== undefined) {
    taskToMove.groupId = overGroupId;
    const tasksInGroup = filteredTasks.filter(t => t.groupId === overGroupId && !t.parentId);
    taskToMove.order = tasksInGroup.length;
  } else if (overTask) {
    // 同じレベルでの並び替え
    const targetTasks = filteredTasks.filter(t => {
      if (overTask.groupId) {
        return t.groupId === overTask.groupId && !t.parentId;
      }
      return !t.groupId && !t.parentId;
    });

    const overTaskIndex = targetTasks.findIndex(t => t.id === overTask.id);
    taskToMove.groupId = overTask.groupId;
    taskToMove.order = overTask.order;

    // 他のタスクの順序を更新
    targetTasks.forEach(task => {
      if (task.order >= overTask.order) {
        task.order += 1;
      }
    });
  }

  // 更新されたタスクを配列に追加
  filteredTasks.push(taskToMove);

  // サブタスクの構造を維持しながらタスクの順序を更新
  const finalTasks = preserveSubtasks(tasks, filteredTasks);
  
  console.log('Updated tasks:', finalTasks);
  updateTaskOrder(finalTasks);
};