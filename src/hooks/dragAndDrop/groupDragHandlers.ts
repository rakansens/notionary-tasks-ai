import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { Group } from "../../types/models";

export const handleGroupDragStart = (
  event: DragStartEvent,
  setActiveId: (id: string | null) => void
) => {
  setActiveId(String(event.active.id));
};

export const handleGroupDragEnd = (
  event: DragEndEvent,
  groups: Group[],
  updateOrder: (items: Group[]) => void,
  setActiveId: (id: string | null) => void
) => {
  const { active, over } = event;
  
  if (!over) {
    setActiveId(null);
    return;
  }

  const activeId = active.id.toString();
  const overId = over.id.toString();
  
  if (activeId === overId) {
    setActiveId(null);
    return;
  }

  const oldIndex = groups.findIndex(group => group.id.toString() === activeId);
  const newIndex = groups.findIndex(group => group.id.toString() === overId);

  if (oldIndex !== -1 && newIndex !== -1) {
    const updatedGroups = [...groups];
    const [movedGroup] = updatedGroups.splice(oldIndex, 1);
    updatedGroups.splice(newIndex, 0, movedGroup);

    // 順序を更新
    const reorderedGroups = updatedGroups.map((group, index) => ({
      ...group,
      order: index,
    }));

    updateOrder(reorderedGroups);
  }

  setActiveId(null);
};

export const handleGroupDragCancel = (
  setActiveId: (id: string | null) => void
) => {
  setActiveId(null);
};
