import { useState } from "react";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import type { Task, Group } from "./taskManager/types";
import type { DragAndDropState } from "./dragAndDrop/types";
import { handleGroupDragEnd } from "./dragAndDrop/groupDragHandlers";
import { handleTaskDragEnd } from "./dragAndDrop/taskDragHandlers";

export const useDragAndDrop = (
  tasks: Task[],
  groups: Group[],
  updateTaskOrder: (tasks: Task[]) => void,
  updateGroupOrder?: (groups: Group[]) => void
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

    // グループのドラッグ&ドロップ
    if (activeId.startsWith('group-') && overId.startsWith('group-') && updateGroupOrder) {
      handleGroupDragEnd(activeId, overId, groups, tasks, updateTaskOrder, updateGroupOrder);
    } else {
      // タスクのドラッグ&ドロップ
      handleTaskDragEnd(activeId, overId, tasks, updateTaskOrder);
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