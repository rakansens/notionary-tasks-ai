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
  const newGroupId = isMovingOutOfGroup ? undefined : (overTask?.groupId || Number(overId.replace('group-', '')));
  const tasksInTargetArea = tasks.filter(task => {
    if (newGroupId) {
      // グループ内のタスクの場合
      return task.groupId === newGroupId && !task.parentId;
    } else {
      // グループ外のタスクの場合
      return !task.groupId && !task.parentId;
    }
  }).sort((a, b) => a.order - b.order);

  // Update task order
  const updatedTasks = [...tasks];
  const taskToMove = updatedTasks.find(t => t.id === activeTaskId);
  if (!taskToMove) return;

  // Remove task from current position
  const filteredTasks = updatedTasks.filter(t => t.id !== activeTaskId);

  // Update task's group
  taskToMove.groupId = newGroupId;

  if (isMovingOutOfGroup) {
    // グループ外に移動する場合
    const nonGroupTasks = filteredTasks.filter(t => !t.groupId && !t.parentId);
    const maxOrder = nonGroupTasks.length > 0
      ? Math.max(...nonGroupTasks.map(t => t.order), -1)
      : -1;
    taskToMove.order = maxOrder + 1;
  } else {
    // 通常の移動の場合
    if (tasksInTargetArea.length === 0) {
      // グループが空の場合は最初の位置に配置
      taskToMove.order = 0;
    } else {
      const overIndex = tasksInTargetArea.findIndex(task => task.id === overTaskId);
      if (overIndex >= 0) {
        const targetTask = tasksInTargetArea[overIndex];
        const currentIndex = tasksInTargetArea.findIndex(task => task.id === activeTaskId);
        let newOrder;

        if (currentIndex === -1) {
          // タスクが別のエリアから移動してきた場合
          newOrder = targetTask.order;
          // 後続のタスクの順序をシフト
          filteredTasks.forEach(task => {
            if ((task.groupId === newGroupId || (!task.groupId && !newGroupId)) && 
                task.order >= newOrder) {
              task.order += 1;
            }
          });
        } else {
          // 同じエリア内での移動
          if (currentIndex < overIndex) {
            // 上から下への移動
            newOrder = targetTask.order;
            // 間のタスクの順序を上にシフト
            filteredTasks.forEach(task => {
              if ((task.groupId === newGroupId || (!task.groupId && !newGroupId)) && 
                  task.order > activeTask.order && 
                  task.order <= targetTask.order) {
                task.order -= 1;
              }
            });
          } else {
            // 下から上への移動
            newOrder = targetTask.order;
            // 間のタスクの順序を下にシフト
            filteredTasks.forEach(task => {
              if ((task.groupId === newGroupId || (!task.groupId && !newGroupId)) && 
                  task.order >= targetTask.order && 
                  task.order < activeTask.order) {
                task.order += 1;
              }
            });
          }
        }
        taskToMove.order = newOrder;
      } else {
        // 最後に追加する場合
        const maxOrder = Math.max(...tasksInTargetArea.map(t => t.order), -1);
        taskToMove.order = maxOrder + 1;
      }
    }
  }

  // Insert task at new position
  filteredTasks.push(taskToMove);

  // Sort tasks by order
  const sortedTasks = filteredTasks.sort((a, b) => {
    if (a.groupId === b.groupId) {
      return a.order - b.order;
    }
    return 0;
  });

  updateTaskOrder(sortedTasks);
};