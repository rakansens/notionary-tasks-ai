import { Task } from "../../types/models";
import { DraggableItem, OrderUpdate, isTask, isGroup } from "./types";
import { normalizeTaskData } from "../../utils/taskUtils";

export const calculateNewOrder = (
  activeItem: DraggableItem,
  overItem: DraggableItem,
  items: DraggableItem[],
  options?: {
    parentId?: number;
    groupId?: number;
  }
): OrderUpdate[] => {
  const updates: OrderUpdate[] = [];
  const sortedItems = [...items].sort((a, b) => a.order - b.order);
  const activeIndex = sortedItems.findIndex(item => item.id === activeItem.id);
  const overIndex = sortedItems.findIndex(item => item.id === overItem.id);

  if (activeIndex === -1 || overIndex === -1) return updates;

  // 移動するアイテムを一時的に削除
  const [movedItem] = sortedItems.splice(activeIndex, 1);
  // 新しい位置に挿入
  sortedItems.splice(overIndex, 0, movedItem);

  // タスクの場合のみレベルを更新
  if (isTask(activeItem) && isTask(overItem)) {
    // 親タスクのレベルを取得
    const parentTask = items.find(item =>
      isTask(item) && item.id === overItem.parentId
    );
    const parentLevel = parentTask && isTask(parentTask) ? parentTask.level || 1 : 0;

    // 移動先のレベルを計算
    const targetLevel = parentLevel ? Math.min(parentLevel + 1, 3) : 1;

    // 順序と階層の更新を計算
    sortedItems.forEach((item, index) => {
      const isActiveItem = item.id === activeItem.id;
      const needsUpdate = item.order !== index || isActiveItem;

      if (needsUpdate) {
        let update: OrderUpdate;
        if (isTask(item)) {
          // 親子関係とレベルの更新
          const newParentId = isActiveItem ? overItem.parentId : item.parentId;
          const parentTask = newParentId ? items.find(t => isTask(t) && t.id === newParentId) as Task | null : null;
          const newLevel = parentTask && isTask(parentTask) ? Math.min((parentTask.level || 1) + 1, 3) : 1;

          const normalizedTask = normalizeTaskData({
            ...item,
            order: index,
            parentId: newParentId,
            level: isActiveItem ? newLevel : item.level,
          });
          update = {
            id: normalizedTask.id,
            order: normalizedTask.order,
            parentId: normalizedTask.parentId,
            level: normalizedTask.level,
            subtasks: normalizedTask.subtasks
          };
        } else {
          update = {
            id: item.id,
            order: index,
            groupId: isGroup(item) ? item.id : undefined
          };
        }
        updates.push(update);

        // サブタスクのレベルも更新
        if (isActiveItem && isTask(item) && item.subtasks) {
          const updateSubtaskLevels = (subtasks: Task[], parentLevel: number) => {
            subtasks.forEach(subtask => {
              const newLevel = Math.min(parentLevel + 1, 3);
              const normalizedSubtask = normalizeTaskData({
                ...subtask,
                level: newLevel
              });
              updates.push({
                id: normalizedSubtask.id,
                order: normalizedSubtask.order,
                parentId: normalizedSubtask.parentId,
                level: normalizedSubtask.level,
                subtasks: normalizedSubtask.subtasks
              });
              if (subtask.subtasks) {
                updateSubtaskLevels(subtask.subtasks, newLevel);
              }
            });
          };
          updateSubtaskLevels(item.subtasks, targetLevel);
        }
      }
    });
  } else {
    // グループまたは異なる種類のアイテム間の移動の場合は順序のみ更新
    sortedItems.forEach((item, index) => {
      if (item.order !== index) {
        let update: OrderUpdate;
        if (isTask(item)) {
          const normalizedTask = normalizeTaskData({
            ...item,
            order: index
          });
          update = {
            id: normalizedTask.id,
            order: normalizedTask.order,
            parentId: normalizedTask.parentId,
            level: normalizedTask.level,
            subtasks: normalizedTask.subtasks
          };
        } else {
          update = {
            id: item.id,
            order: index,
            groupId: isGroup(item) ? item.id : undefined
          };
        }
        updates.push(update);
      }
    });
  }

  return updates;
};

export const validateDrop = (
  activeItem: DraggableItem,
  overItem: DraggableItem,
  items: DraggableItem[]
): boolean => {
  // 同じ位置へのドロップを防ぐ
  if (activeItem.id === overItem.id) return false;

  // タスクの場合、循環参照をチェック
  if ('parentId' in activeItem && 'parentId' in overItem) {
    const wouldCreateCycle = checkForCyclicDependency(
      activeItem.id,
      overItem.id,
      items as any[]
    );
    if (wouldCreateCycle) return false;
  }

  return true;
};

const checkForCyclicDependency = (
  sourceId: number,
  targetId: number,
  items: { id: number; parentId?: number }[]
): boolean => {
  const visited = new Set<number>();

  const checkCycle = (currentId: number): boolean => {
    if (currentId === sourceId) return true;
    if (visited.has(currentId)) return false;

    visited.add(currentId);
    const item = items.find(i => i.id === currentId);
    if (!item?.parentId) return false;

    return checkCycle(item.parentId);
  };

  return checkCycle(targetId);
}; 