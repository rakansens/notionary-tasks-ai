import { useState } from "react";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import type { Task, Group } from "./useTaskManager";

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

  const handleDragStart = (event: DragStartEvent) => {
    setState({ activeId: String(event.active.id) });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setState({ activeId: null });
      return;
    }

    const activeId = Number(active.id);
    const overId = Number(over.id);
    
    if (activeId === overId) {
      setState({ activeId: null });
      return;
    }

    const activeTask = tasks.find(task => task.id === activeId);
    const overTask = tasks.find(task => task.id === overId);
    
    if (!activeTask || !overTask) {
      setState({ activeId: null });
      return;
    }

    // Calculate new index and group
    const newGroupId = overTask.groupId;
    const tasksInTargetGroup = tasks.filter(task => 
      task.groupId === newGroupId && !task.parentId
    );
    const overIndex = tasksInTargetGroup.findIndex(task => task.id === overId);

    console.log('Drag end:', {
      activeTask,
      overTask,
      newGroupId,
      overIndex,
      tasksInTargetGroup: tasksInTargetGroup.map(t => ({ id: t.id, title: t.title }))
    });
    
    // Update task order
    updateTaskOrder(activeId, newGroupId, overIndex);
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