import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/models";

export const useTaskDragAndDrop = (task: Task, parentTask?: Task) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ 
    id: task.id.toString(),
    data: {
      type: 'task',
      task,
      parentId: parentTask?.id,
      level: task.level,
    },
  });

  console.log('TaskDragAndDrop state:', {
    taskId: task.id,
    taskTitle: task.title,
    isDragging,
    transform,
    parentTaskId: parentTask?.id,
    level: task.level
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 999 : "auto",
    backgroundColor: isDragging ? "white" : "transparent",
    touchAction: "none",
  };

  console.log('TaskDragAndDrop style:', {
    taskId: task.id,
    style,
    isDragging
  });

  return {
    dragHandleProps: { ...attributes, ...listeners },
    setNodeRef,
    style,
    isDragging,
  };
};