import { useState } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { Task, Group } from "./useTaskManager";

interface DragAndDropState {
  activeId: string | null;
}

export const useDragAndDrop = (
  tasks: Task[],
  groups: Group[],
  updateTaskOrder: (taskId: number, newGroupId?: number, newIndex?: number) => void
) => {
  const [state, setState] = useState<DragAndDropState>({
    activeId: null,
  });

  const handleDragStart = (event: { active: { id: string } }) => {
    setState({ activeId: event.active.id });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);
    
    if (activeId === overId) return;

    const activeTask = tasks.find(task => task.id === activeId);
    const overTask = tasks.find(task => task.id === overId);
    
    if (!activeTask) return;

    // If dropping over a task
    if (overTask) {
      const activeIndex = tasks.findIndex(task => task.id === activeId);
      const overIndex = tasks.findIndex(task => task.id === overId);
      updateTaskOrder(activeId, overTask.groupId, overIndex);
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