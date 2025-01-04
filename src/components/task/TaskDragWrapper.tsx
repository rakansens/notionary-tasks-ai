import { Task } from "@/types/models";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskDragWrapperProps {
  task: Task;
  parentTask?: Task;
  children: (dragHandleProps: {
    attributes: Record<string, any>;
    listeners: Record<string, any>;
  }) => React.ReactElement;
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
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 999 : "auto",
    backgroundColor: isDragging ? "white" : "transparent",
    touchAction: "none",
  };

  console.log(`TaskDragWrapper: Rendering task ${task.id}, isDragging: ${isDragging}`);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "shadow-lg rounded-md" : ""}`}
    >
      {children({ attributes, listeners })}
    </div>
  );
};