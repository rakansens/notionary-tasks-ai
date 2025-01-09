import { useTaskManager } from "../../hooks/taskManager/useTaskManager.tsx";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import { Task } from "../../types/models";
import { useEffect, useRef, useState, useCallback } from "react";

interface TaskItemProps {
  task: Task;
  parentTask?: Task;
  editingTaskId: number | null;
  addingSubtaskId: number | null;
  setEditingTaskId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
  toggleTask: (id: number, parentId?: number) => void;
  updateTaskTitle: (id: number, title: string, parentId?: number) => void;
  deleteTask: (id: number, parentId?: number) => void;
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: (groupId?: number, parentId?: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: () => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
}

export const TaskItem = ({
  task,
  parentTask,
  editingTaskId,
  addingSubtaskId,
  setEditingTaskId,
  setAddingSubtaskId,
  toggleTask,
  updateTaskTitle,
  deleteTask,
  newTask,
  setNewTask,
  addTask,
  onDragStart,
  onDragEnd,
  onDragOver,
  isDragging,
  isDropTarget,
}: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTaskId === task.id) {
      setIsEditing(true);
      inputRef.current?.focus();
    } else {
      setIsEditing(false);
      setTitle(task.title);
    }
  }, [editingTaskId, task.id, task.title]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateTaskTitle(task.id, title, parentTask?.id);
      setEditingTaskId(null);
    } else if (e.key === 'Escape') {
      setTitle(task.title);
      setEditingTaskId(null);
    }
  }, [task.id, task.title, title, parentTask?.id, updateTaskTitle, setEditingTaskId]);

  const handleBlur = useCallback(() => {
    if (title !== task.title) {
      updateTaskTitle(task.id, title, parentTask?.id);
    }
    setEditingTaskId(null);
  }, [task.id, task.title, title, parentTask?.id, updateTaskTitle, setEditingTaskId]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-1",
        isDragging && "opacity-50",
        isDropTarget && "bg-gray-100"
      )}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.();
      }}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => toggleTask(task.id, parentTask?.id)}
        className={cn(
          "h-4 w-4 rounded border-gray-300",
          task.completed && "bg-blue-500 border-blue-500"
        )}
      />
      {isEditing ? (
        <Input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="flex-1 h-6 px-1 text-sm"
        />
      ) : (
        <div
          onClick={() => setEditingTaskId(task.id)}
          className={cn(
            "flex-1 cursor-text text-sm",
            task.completed && "line-through text-gray-500"
          )}
        >
          {task.title}
        </div>
      )}
    </div>
  );
};