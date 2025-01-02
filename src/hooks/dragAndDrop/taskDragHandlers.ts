import { Task } from "../taskManager/types";
import type { UpdateTaskOrderFn } from "./types";

export const handleTaskDragEnd = (
  activeId: string,
  overId: string,
  tasks: Task[],
  updateTaskOrder: UpdateTaskOrderFn
) => {
  const activeTaskId = Number(activeId);
  const overTaskId = Number(overId);

  const activeTask = tasks.find(task => task.id === activeTaskId);
  const overTask = tasks.find(task => task.id === overTaskId);
  
  if (!activeTask) return;

  // グループ外への移動かどうかを判定
  const isMovingOutOfGroup = activeTask.groupId && (!overTask || !overTask.groupId);

  // Calculate new index and group
  const newGroupId = isMovingOutOfGroup ? undefined : (overTask?.groupId || undefined);
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

  // タスクを順序でソート
  const sortedTasks = filteredTasks.sort((a, b) => {
    if (a.groupId === b.groupId) {
      return a.order - b.order;
    }
    return 0;
  });

  updateTaskOrder(sortedTasks);
};