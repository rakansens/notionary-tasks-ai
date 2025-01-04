import { DraggableItem, OrderUpdate } from "./types";
import { Task } from "../taskManager/types";

export const calculateNewOrder = (
  activeItem: DraggableItem,
  overItem: DraggableItem,
  items: DraggableItem[],
  options?: {
    parent_task_id?: number;
    group_id?: number;
  }
): OrderUpdate[] => {
  const updates: OrderUpdate[] = [];
  const sortedItems = [...items].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const activeIndex = sortedItems.findIndex(item => item.id === activeItem.id);
  const overIndex = sortedItems.findIndex(item => item.id === overItem.id);

  if (activeIndex === -1 || overIndex === -1) return updates;

  const [movedItem] = sortedItems.splice(activeIndex, 1);
  sortedItems.splice(overIndex, 0, movedItem);

  sortedItems.forEach((item, index) => {
    if ((item.sort_order || 0) !== index) {
      updates.push({
        id: item.id,
        sort_order: index,
        group_id: 'group_id' in item ? item.group_id : undefined,
        parent_task_id: 'parent_task_id' in item ? item.parent_task_id : undefined,
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
  if (activeItem.id === overItem.id) return false;

  if ('parent_task_id' in activeItem && 'parent_task_id' in overItem) {
    const wouldCreateCycle = checkForCyclicDependency(
      activeItem.id,
      overItem.id,
      items as Task[]
    );
    if (wouldCreateCycle) return false;
  }

  return true;
};

const checkForCyclicDependency = (
  sourceId: number,
  targetId: number,
  items: { id: number; parent_task_id?: number }[]
): boolean => {
  const visited = new Set<number>();

  const checkCycle = (currentId: number): boolean => {
    if (currentId === sourceId) return true;
    if (visited.has(currentId)) return false;

    visited.add(currentId);
    const item = items.find(i => i.id === currentId);
    if (!item?.parent_task_id) return false;

    return checkCycle(item.parent_task_id);
  };

  return checkCycle(targetId);
};