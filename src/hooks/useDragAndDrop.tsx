import { useState } from "react";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { Task, Group } from "../types/models";
import { handleGroupDragStart, handleGroupDragEnd, handleGroupDragCancel } from "../hooks/dragAndDrop/groupDragHandlers";
import { handleTaskDragStart, handleTaskDragEnd, handleTaskDragCancel, handleTaskDragOver } from "../hooks/dragAndDrop/taskDragHandlers";

interface UseDragAndDropProps {
  items: Task[] | Group[];
  updateOrder: (items: Task[] | Group[]) => void;
  type: "task" | "group";
}

export const useDragAndDrop = ({ items, updateOrder, type }: UseDragAndDropProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<Task | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    if (type === "task") {
      handleTaskDragStart(event, setActiveId);
    } else {
      handleGroupDragStart(event, setActiveId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (type === "task") {
      handleTaskDragEnd(event, items as Task[], updateOrder as (items: Task[]) => void, setActiveId);
      handleTaskDragOver(event, items as Task[], setDropTarget);
    } else {
      handleGroupDragEnd(event, items as Group[], updateOrder as (items: Group[]) => void, setActiveId);
    }
  };

  const handleDragCancel = () => {
    if (type === "task") {
      handleTaskDragCancel(setActiveId);
      setDropTarget(null);
    } else {
      handleGroupDragCancel(setActiveId);
    }
  };

  return {
    activeId,
    dropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
