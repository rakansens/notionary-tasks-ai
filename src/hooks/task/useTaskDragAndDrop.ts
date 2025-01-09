import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../../types/models";
import { useMemo, useEffect } from "react";

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

  const style = useMemo(() => ({
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: transition || undefined,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 999 : 1,
    backgroundColor: isDragging ? "white" : "transparent",
    touchAction: "none",
  }), [transform, transition, isDragging]);

  const dragHandleProps = useMemo(() => ({
    ...attributes,
    ...listeners
  }), [attributes, listeners]);

  useEffect(() => {
    // ドラッグ中またはトランジション中のみログを出力
    if (isDragging || (transform && transform.x !== 0 && transform.y !== 0) || transition) {
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
    }
  }, [isDragging, transform, transition, task.id, task.title, task.level, task.subtasks, parentTask?.id]);

  return {
    dragHandleProps,
    setNodeRef,
    style,
    isDragging,
  };
};