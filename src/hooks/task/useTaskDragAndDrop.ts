import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/models";

export const useTaskDragAndDrop = (task: Task, parentTask?: Task) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
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

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: transition || undefined,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 999 : 1,
    backgroundColor: isDragging ? "white" : "transparent",
    touchAction: "none",
  };

  console.log('TaskDragAndDrop state:', {
    taskId: task.id,
    taskTitle: task.title,
    isDragging,
    transform: transform ? CSS.Transform.toString(transform) : null,
    transition,
    parentTaskId: parentTask?.id,
    level: task.level,
    subtasks: task.subtasks?.length || 0
  });

  return {
    dragHandleProps: { ...attributes, ...listeners },
    setNodeRef,
    style,
    isDragging,
  };
};