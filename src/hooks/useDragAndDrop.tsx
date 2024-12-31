import { useState } from "react";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import type { Task, Group } from "./useTaskManager";

interface DragAndDropState {
  activeId: string | null;
}

type UpdateTaskOrderFn = (taskId: number, newGroupId?: number, newIndex?: number) => void;

export const useDragAndDrop = (
  tasks: Task[],
  groups: Group[],
  updateTaskOrder: UpdateTaskOrderFn
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
    
    if (!activeTask) {
      setState({ activeId: null });
      return;
    }

    // Calculate new index and group
    const newGroupId = overTask?.groupId;
    const tasksInTargetArea = tasks.filter(task => {
      if (newGroupId) {
        // グループ内のタスクの場合
        return task.groupId === newGroupId && !task.parentId;
      } else {
        // グループ外のタスクの場合
        return !task.groupId && !task.parentId;
      }
    });
    const overIndex = tasksInTargetArea.findIndex(task => task.id === overId);
    
    // Update task order
    updateTaskOrder(activeId, newGroupId, overIndex >= 0 ? overIndex : undefined);
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