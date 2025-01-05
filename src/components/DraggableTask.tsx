import { Task } from "@/types/models";
import { memo } from "react";
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

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`${isDragging ? "shadow-lg rounded-md" : ""}`}
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
        canRenderSubtasks={canRenderSubtasks()}
      />
    </div>
  );
});

DraggableTask.displayName = 'DraggableTask';