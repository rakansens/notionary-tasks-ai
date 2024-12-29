import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { TaskItem } from "./TaskItem";
import type { Task } from "@/hooks/useTaskManager";
import type { CSSProperties } from "react";

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
  parentTask?: Task;
  groupName?: string;
}

export const DraggableTask = ({
  task,
  parentTask,
  groupName,
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

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 transition-shadow duration-200 ${
        isDragging ? 'shadow-lg rounded-md bg-white' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab p-2 hover:bg-notion-hover rounded"
      >
        <GripVertical className="h-4 w-4 text-notion-secondary" />
      </div>
      <div className="flex-1">
        <TaskItem 
          task={task} 
          {...props} 
          parentTask={parentTask}
          groupName={groupName}
        />
      </div>
    </div>
  );
};