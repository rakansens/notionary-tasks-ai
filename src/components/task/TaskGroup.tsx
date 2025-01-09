import { useTaskManager } from "../../hooks/taskManager/useTaskManager";
import { TaskItem } from "./TaskItem";
import { Task } from "../../types/models";
import { DraggableItem } from "../../hooks/dragAndDrop/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface TaskGroupProps {
  tasks: Task[];
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
  onReorderTasks?: (startIndex: number, endIndex: number) => void;
}

export const TaskGroup = ({
  tasks,
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
  onReorderTasks,
}: TaskGroupProps) => {
  const [draggedTask, setDraggedTask] = useState<DraggableItem | null>(null);
  const [dropTarget, setDropTarget] = useState<DraggableItem | null>(null);
  const dragTimeoutRef = useRef<number>();

  const handleDragStart = useCallback((task: Task) => {
    setDraggedTask(task);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (draggedTask && dropTarget && onReorderTasks) {
      const startIndex = tasks.findIndex(t => t.id === draggedTask.id);
      const endIndex = tasks.findIndex(t => t.id === dropTarget.id);
      if (startIndex !== -1 && endIndex !== -1) {
        onReorderTasks(startIndex, endIndex);
      }
    }
    setDraggedTask(null);
    setDropTarget(null);
  }, [draggedTask, dropTarget, tasks, onReorderTasks]);

  const handleDragOver = useCallback((task: Task) => {
    if (dragTimeoutRef.current) {
      window.clearTimeout(dragTimeoutRef.current);
    }
    dragTimeoutRef.current = window.setTimeout(() => {
      setDropTarget(task);
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        window.clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          editingTaskId={editingTaskId}
          addingSubtaskId={addingSubtaskId}
          setEditingTaskId={setEditingTaskId}
          setAddingSubtaskId={setAddingSubtaskId}
          toggleTask={toggleTask}
          updateTaskTitle={updateTaskTitle}
          deleteTask={deleteTask}
          newTask={newTask}
          setNewTask={setNewTask}
          addTask={addTask}
          onDragStart={() => handleDragStart(task)}
          onDragEnd={handleDragEnd}
          onDragOver={() => handleDragOver(task)}
          isDragging={draggedTask?.id === task.id}
          isDropTarget={dropTarget?.id === task.id}
        />
      ))}
    </div>
  );
};