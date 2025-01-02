import { useState } from "react";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { DraggableItem, DragAndDropState, DragAndDropOptions } from "./types";
import { calculateNewOrder, validateDrop } from "./utils";

export const useDragAndDrop = (
  items: DraggableItem[],
  updateOrder: (items: DraggableItem[]) => void,
  options?: DragAndDropOptions
) => {
  const [state, setState] = useState<DragAndDropState>({
    activeId: null,
  });

  const handleDragStart = (event: DragStartEvent) => {
    setState({ activeId: String(event.active.id) });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setState({ activeId: null });
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    if (activeId === overId) {
      setState({ activeId: null });
      return;
    }

    const activeItem = items.find(item => item.id.toString() === activeId);
    const overItem = items.find(item => item.id.toString() === overId);

    if (!activeItem || !overItem) {
      setState({ activeId: null });
      return;
    }

    if (!validateDrop(activeItem, overItem, items)) {
      setState({ activeId: null });
      return;
    }

    const updates = calculateNewOrder(activeItem, overItem, items, options);
    const updatedItems = items.map(item => {
      const update = updates.find(u => u.id === item.id);
      if (update) {
        return {
          ...item,
          order: update.order,
          ...(update.groupId !== undefined && { groupId: update.groupId }),
          ...(update.parentId !== undefined && { parentId: update.parentId }),
        };
      }
      return item;
    });

    updateOrder(updatedItems);
    if (options?.onOrderUpdate) {
      options.onOrderUpdate(updates);
    }

    setState({ activeId: null });
  };

  const handleDragCancel = () => {
    setState({ activeId: null });
  };

  return {
    dragAndDropState: state,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}; 