import { Task } from "../taskManager/types";
import type { UpdateTaskOrderFn } from "./types";

export const handleTaskDragEnd = (
  activeId: string,
  overId: string,
  tasks: Task[],
  updateTaskOrder: UpdateTaskOrderFn
) => {
  const activeTaskId = Number(activeId);
  const overTaskId = overId.startsWith('group-') ? undefined : Number(overId);
  const overGroupId = overId.startsWith('group-') ? Number(overId.replace('group-', '')) : undefined;

  const activeTask = tasks.find(task => task.id === activeTaskId);
  const overTask = overTaskId ? tasks.find(task => task.id === overTaskId) : undefined;
  
  if (!activeTask) return;

  // グループ外への移動かどうかを判定
  const isMovingOutOfGroup = activeTask.groupId && (!overTask?.groupId && !overGroupId);
  const isMovingToGroup = overGroupId !== undefined;

  // Calculate new index and group
  const newGroupId = isMovingToGroup ? overGroupId : (overTask?.groupId || undefined);

  // タスクの順序を更新
  const updatedTasks = [...tasks];
  const taskToMove = { ...activeTask }; // タスクのコピーを作成

  // 現在の位置からタスクを削除
  const filteredTasks = updatedTasks.filter(t => t.id !== activeTaskId);

  // タスクのグループを更新
  taskToMove.groupId = newGroupId;

  // 移動先のタスクリストを取得（グループ内またはグループ外）
  const tasksInTargetArea = filteredTasks.filter(task => {
    if (newGroupId) {
      return task.groupId === newGroupId && !task.parentId;
    } else {
      return !task.groupId && !task.parentId;
    }
  }).sort((a, b) => a.order - b.order);

  if (isMovingOutOfGroup || isMovingToGroup) {
    // グループ外への移動またはグループへの直接移動
    taskToMove.order = tasksInTargetArea.length > 0
      ? Math.max(...tasksInTargetArea.map(t => t.order)) + 1
      : 0;
  } else if (overTask) {
    // 同じエリア内での移動
    const currentIndex = tasksInTargetArea.findIndex(t => t.id === activeTaskId);
    const targetIndex = tasksInTargetArea.findIndex(t => t.id === overTask.id);

    // 移動先の位置に基づいて新しい順序を設定
    if (currentIndex === -1) {
      // 別のエリアからの移動
      taskToMove.order = overTask.order;
      tasksInTargetArea.forEach(task => {
        if (task.order >= overTask.order) {
          task.order += 1;
        }
      });
    } else {
      // 同じエリア内での移動
      const direction = currentIndex < targetIndex ? 1 : -1;
      taskToMove.order = overTask.order;

      tasksInTargetArea.forEach(task => {
        if (direction > 0) {
          // 上から下への移動
          if (task.order > activeTask.order && task.order <= overTask.order) {
            task.order -= 1;
          }
        } else {
          // 下から上への移動
          if (task.order >= overTask.order && task.order < activeTask.order) {
            task.order += 1;
          }
        }
      });
    }
  } else {
    // 最後に追加
    taskToMove.order = tasksInTargetArea.length > 0
      ? Math.max(...tasksInTargetArea.map(t => t.order)) + 1
      : 0;
  }

  // 更新されたタスクを配列に追加
  filteredTasks.push(taskToMove);

  // タスクの順序を更新
  updateTaskOrder(filteredTasks);
};