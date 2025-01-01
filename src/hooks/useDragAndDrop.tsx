import { useState } from "react";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import type { Task, Group } from "./taskManager/types";
import { handleGroupDragEnd } from "./dragAndDrop/groupDragHandlers";
import { handleTaskDragEnd } from "./dragAndDrop/taskDragHandlers";

interface DragAndDropState {
  activeId: string | null;
}

type UpdateTaskOrderFn = (tasks: Task[]) => void;
type UpdateGroupOrderFn = (groups: Group[]) => void;

export const useDragAndDrop = (
  tasks: Task[],
  groups: Group[],
  updateTaskOrder: UpdateTaskOrderFn,
  updateGroupOrder?: UpdateGroupOrderFn
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
    if (activeId.startsWith('group-') && overId.startsWith('group-')) {
      const activeGroupId = Number(activeId.replace('group-', ''));
      const overGroupId = Number(overId.replace('group-', ''));

      if (updateGroupOrder) {
        const updatedGroups = handleGroupDragEnd(groups, activeGroupId, overGroupId);
        updateGroupOrder(updatedGroups);
      }
    } else {
      // タスクのドラッグ&ドロップ
      const activeTaskId = Number(activeId);
      const overTaskId = Number(overId);
      const newGroupId = overId.startsWith('group-') 
        ? Number(overId.replace('group-', ''))
        : undefined;

      const updatedTasks = handleTaskDragEnd(tasks, activeTaskId, overTaskId, newGroupId);
      updateTaskOrder(updatedTasks);
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