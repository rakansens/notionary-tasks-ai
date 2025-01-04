import { DraggableItem, OrderUpdate } from "./types";

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

  // 順序の更新を計算
  sortedItems.forEach((item, index) => {
    if (item.order !== index) {
      updates.push({
        id: item.id,
        order: index,
        groupId: 'groupId' in item ? item.groupId : undefined,
        parentId: 'parentId' in item ? item.parentId : undefined,
      });
    }
  });

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