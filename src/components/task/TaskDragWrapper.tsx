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
      type: "task",
      task,
      parentId: parentTask?.id,
      level: task.level,
    },
  });

  console.log(`TaskDragWrapper: Task ${task.id} isDragging:`, isDragging, 'transform:', transform);

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    zIndex: isDragging ? 999 : 1,
    backgroundColor: isDragging ? "white" : "transparent",
    touchAction: "none",
    userSelect: "none",
    cursor: isDragging ? "grabbing" : "default",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "shadow-lg rounded-md" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        console.log('TaskDragWrapper clicked:', task.id);
      }}
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