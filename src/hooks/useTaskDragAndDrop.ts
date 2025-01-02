import { useState } from "react";
import { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { Task, Group } from "./taskManager/types";

interface TaskDragAndDropState {
  activeId: string | null;
}

export const useTaskDragAndDrop = (
  tasks: Task[],
  groups: Group[],
  updateTaskOrder: (tasks: Task[]) => void,
  updateGroupOrder: (groups: Group[]) => void
) => {
  const [dragAndDropState, setDragAndDropState] = useState<TaskDragAndDropState>({
    activeId: null,
  });

  const handleDragStart = (event: DragStartEvent) => {
    setDragAndDropState({ activeId: String(event.active.id) });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setDragAndDropState({ activeId: null });
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    if (activeId === overId) {
      setDragAndDropState({ activeId: null });
      return;
    }

    if (activeId.startsWith('group-') && overId.startsWith('group-')) {
      const startIndex = groups.findIndex(g => g.id === Number(activeId.replace('group-', '')));
      const endIndex = groups.findIndex(g => g.id === Number(overId.replace('group-', '')));
      
      if (startIndex !== -1 && endIndex !== -1) {
        const reorderedGroups = [...groups];
        const [movedGroup] = reorderedGroups.splice(startIndex, 1);
        reorderedGroups.splice(endIndex, 0, movedGroup);
        
        updateGroupOrder(reorderedGroups);
      }
    } else {
      const startIndex = tasks.findIndex(t => t.id === Number(activeId));
      const endIndex = tasks.findIndex(t => t.id === Number(overId));
      
      if (startIndex !== -1 && endIndex !== -1) {
        const reorderedTasks = [...tasks];
        const [movedTask] = reorderedTasks.splice(startIndex, 1);
        reorderedTasks.splice(endIndex, 0, movedTask);
        
        updateTaskOrder(reorderedTasks);
      }
    }

    setDragAndDropState({ activeId: null });
  };

  const handleDragCancel = () => {
    setDragAndDropState({ activeId: null });
  };

  return {
    dragAndDropState,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};