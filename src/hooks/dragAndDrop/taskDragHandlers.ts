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
  const tasksInTargetArea = tasks.filter(task => {
    if (newGroupId) {
      // グループ内のタスクの場合
      return task.groupId === newGroupId && !task.parentId;
    } else {
      // グループ外のタスクの場合
      return !task.groupId && !task.parentId;
    }
  }).sort((a, b) => a.order - b.order);

  // タスクの順序を更新
  const updatedTasks = [...tasks];
  const taskToMove = { ...activeTask }; // タスクのコピーを作成

  // 現在の位置からタスクを削除
  const filteredTasks = updatedTasks.filter(t => t.id !== activeTaskId);

  // タスクのグループを更新
  taskToMove.groupId = newGroupId;

  if (isMovingOutOfGroup) {
    // グループ外に移動する場合
    const nonGroupTasks = filteredTasks.filter(t => !t.groupId && !t.parentId);
    const maxOrder = nonGroupTasks.length > 0
      ? Math.max(...nonGroupTasks.map(t => t.order))
      : -1;
    taskToMove.order = maxOrder + 1;
  } else if (isMovingToGroup) {
    // グループに直接移動する場合
    const groupTasks = filteredTasks.filter(t => t.groupId === newGroupId && !t.parentId);
    const maxOrder = groupTasks.length > 0
      ? Math.max(...groupTasks.map(t => t.order))
      : -1;
    taskToMove.order = maxOrder + 1;
  } else {
    // 通常の移動の場合
    const overIndex = tasksInTargetArea.findIndex(task => task.id === overTaskId);
    
    if (overIndex === -1) {
      // 最後に追加する場合
      const maxOrder = tasksInTargetArea.length > 0
        ? Math.max(...tasksInTargetArea.map(t => t.order))
        : -1;
      taskToMove.order = maxOrder + 1;
    } else {
      // 特定の位置に挿入する場合
      const targetTask = tasksInTargetArea[overIndex];
      const currentIndex = tasksInTargetArea.findIndex(task => task.id === activeTaskId);

      if (currentIndex === -1) {
        // 別のエリアからの移動
        taskToMove.order = targetTask.order;
        filteredTasks.forEach(task => {
          if ((task.groupId === newGroupId || (!task.groupId && !newGroupId)) && 
              task.order >= targetTask.order) {
            task.order += 1;
          }
        });
      } else {
        // 同じエリア内での移動
        if (currentIndex < overIndex) {
          // 上から下への移動
          taskToMove.order = targetTask.order;
          filteredTasks.forEach(task => {
            if ((task.groupId === newGroupId || (!task.groupId && !newGroupId)) && 
                task.order > activeTask.order && 
                task.order <= targetTask.order) {
              task.order -= 1;
            }
          });
        } else {
          // 下から上への移動
          taskToMove.order = targetTask.order;
          filteredTasks.forEach(task => {
            if ((task.groupId === newGroupId || (!task.groupId && !newGroupId)) && 
                task.order >= targetTask.order && 
                task.order < activeTask.order) {
              task.order += 1;
            }
          });
        }
      }
    }
  }

  // 更新されたタスクを配列に追加
  filteredTasks.push(taskToMove);

  // タスクの順序を更新
  updateTaskOrder(filteredTasks);
};