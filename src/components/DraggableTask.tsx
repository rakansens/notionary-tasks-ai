import { Task } from "@/types/models";
import { memo, useMemo } from "react";
import { useTaskCollapse } from "@/hooks/taskManager/useTaskCollapse";
import { useTaskDragAndDrop } from "@/hooks/task/useTaskDragAndDrop";
import { useSubtaskRenderer } from "@/hooks/task/useSubtaskRenderer";
import { TaskContent } from "./task/TaskContent";

interface DraggableTaskProps {
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
  onReorderSubtasks?: (startIndex: number, endIndex: number, parentId: number) => void;
}

const arePropsEqual = (prevProps: DraggableTaskProps, nextProps: DraggableTaskProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.completed === nextProps.task.completed &&
    prevProps.task.level === nextProps.task.level &&
    prevProps.task.order === nextProps.task.order &&
    prevProps.task.parentId === nextProps.task.parentId &&
    prevProps.editingTaskId === nextProps.editingTaskId &&
    prevProps.addingSubtaskId === nextProps.addingSubtaskId &&
    prevProps.newTask === nextProps.newTask &&
    JSON.stringify(prevProps.task.subtasks) === JSON.stringify(nextProps.task.subtasks) &&
    (prevProps.parentTask?.id === nextProps.parentTask?.id &&
    prevProps.parentTask?.level === nextProps.parentTask?.level)
  );
};

export const DraggableTask = memo(({
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
  onReorderSubtasks,
}: DraggableTaskProps) => {
  const { isTaskCollapsed, toggleTaskCollapse } = useTaskCollapse();
  const { dragHandleProps, setNodeRef, style, isDragging } = useTaskDragAndDrop(task, parentTask);
  const subtasks = task.subtasks || [];
  const isCollapsed = isTaskCollapsed(task.id);
  const { canRenderSubtasks } = useSubtaskRenderer(task, subtasks, isCollapsed, parentTask);
  const shouldRenderSubtasks = useMemo(() => canRenderSubtasks(), [
    task.id,
    task.subtasks,
    isCollapsed,
    parentTask,
    canRenderSubtasks
  ]);

  // ドラッグ中またはサブタスクの表示状態が変化した時のみログを出力
  if (isDragging || style.transform) {
    console.log('DraggableTask render:', {
      taskId: task.id,
      taskTitle: task.title,
      isDragging,
      isCollapsed,
      subtasksCount: subtasks.length,
      canRenderSubtasks: shouldRenderSubtasks,
      style
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ${isDragging ? "shadow-lg rounded-md bg-white" : ""}`}
    >
      <TaskContent
        task={task}
        parentTask={parentTask}
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
        onReorderSubtasks={onReorderSubtasks}
        dragHandleProps={dragHandleProps}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => toggleTaskCollapse(task.id)}
        canRenderSubtasks={shouldRenderSubtasks}
      />
    </div>
  );
});

DraggableTask.displayName = 'DraggableTask';