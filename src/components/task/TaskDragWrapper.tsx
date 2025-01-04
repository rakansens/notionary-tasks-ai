import { Task } from "@/types/models";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSProperties } from "react";

interface DragHandleProps {
  attributes: Record<string, any>;
  listeners: Record<string, any>;
}

interface TaskDragWrapperProps {
  task: Task;
  parentTask?: Task;
  children: (dragHandleProps: DragHandleProps) => React.ReactElement;
}

export const TaskDragWrapper = ({
  task,
  parentTask,
  children,
}: TaskDragWrapperProps) => {
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
    disabled: task.level >= 4,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    zIndex: isDragging ? 999 : 1,
    backgroundColor: isDragging ? "white" : "transparent",
    touchAction: "none",
    pointerEvents: "auto",
    cursor: isDragging ? "grabbing" : "grab",
    userSelect: "none",
  };

  console.log(`TaskDragWrapper: Rendering task ${task.id}, isDragging: ${isDragging}, level: ${task.level}`);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "shadow-lg rounded-md" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children({ 
        attributes: {
          ...attributes,
          style: { cursor: isDragging ? "grabbing" : "grab" }
        }, 
        listeners 
      })}
    </div>
  );
};