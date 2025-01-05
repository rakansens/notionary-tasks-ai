import { useState } from "react";
import { DragStartEvent, DragEndEvent, useDraggable } from "@dnd-kit/core";
import { Task } from "@/types/models";
import { CSS } from "@dnd-kit/utilities";

export const useTaskDragAndDrop = (task: Task, parentTask?: Task) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: task.id.toString(),
    data: {
      task,
      parentTask,
    },
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
  } : undefined;

  const dragHandleProps = {
    ...attributes,
    ...listeners,
  };

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    console.log("Drag started:", event);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    console.log("Drag ended:", event);
  };

  return {
    dragHandleProps,
    setNodeRef,
    style,
    isDragging,
    handleDragStart,
    handleDragEnd,
  };
};