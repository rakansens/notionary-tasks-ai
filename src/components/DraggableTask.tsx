import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskItem } from "./TaskItem";
import type { Task } from "@/hooks/useTaskManager";

interface DraggableTaskProps {
  task: Task;
  editingTaskId: number | null;
  addingSubtaskId: number | null;
  setEditingTaskId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
  toggleTask: (id: number) => void;
  updateTaskTitle: (id: number, title: string) => void;
  deleteTask: (id: number) => void;
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: (groupId?: number) => void;
}

export const DraggableTask = ({
  task,
  ...props
}: DraggableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-none transition-shadow duration-200 ${
        isDragging ? 'shadow-lg rounded-md bg-white' : ''
      }`}
    >
      <TaskItem task={task} {...props} />
    </div>
  );
};