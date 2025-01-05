import { Task } from "@/types/models";
import { TaskItem } from "./TaskItem";
import { SubtaskList } from "./SubtaskList";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTaskCollapse } from "@/hooks/taskManager/useTaskCollapse";
import { memo, useCallback } from "react";

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

  const subtasks = task.subtasks || [];
  const isCollapsed = isTaskCollapsed(task.id);

  const canRenderSubtasks = useCallback(() => {
    const currentLevel = task.level || 1;
    const hasSubtasks = subtasks && subtasks.length > 0;

    console.log('Checking subtask rendering conditions:', {
      taskId: task.id,
      taskTitle: task.title,
      currentLevel,
      hasSubtasks,
      subtasksCount: subtasks.length,
      isCollapsed,
      parentInfo: parentTask ? {
        id: parentTask.id,
        title: parentTask.title,
        level: parentTask.level
      } : null
    });

    // 基本的な表示条件チェック
    if (isCollapsed) {
      console.log('Task is collapsed, not rendering subtasks');
      return false;
    }

    if (!hasSubtasks) {
      console.log('No subtasks to render');
      return false;
    }

    // レベルチェックを緩和（3階層まで許可）
    if (currentLevel >= 3) {
      console.log('Maximum level reached:', currentLevel);
      return false;
    }

    // サブタスクの構造チェック
    const validSubtasks = subtasks.filter(subtask => {
      const subtaskLevel = subtask.level || 1;
      const expectedLevel = currentLevel + 1;
      const hasValidParent = subtask.parentId === task.id;

      console.log('Validating subtask:', {
        subtaskId: subtask.id,
        subtaskTitle: subtask.title,
        subtaskLevel,
        expectedLevel,
        hasValidParent,
        order: subtask.order
      });

      // サブタスクのレベルチェックを修正
      return subtaskLevel === expectedLevel && hasValidParent;
    });

    return validSubtasks.length > 0;
  }, [task.id, task.level, task.title, subtasks, isCollapsed, parentTask]);

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`${isDragging ? "shadow-lg rounded-md" : ""}`}
    >
      <TaskItem
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
        dragHandleProps={{ ...attributes, ...listeners }}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => toggleTaskCollapse(task.id)}
      />
      {canRenderSubtasks() && (
        <SubtaskList
          parentTask={task}
          subtasks={subtasks}
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
          isCollapsed={isCollapsed}
        />
      )}
    </div>
  );
});

DraggableTask.displayName = 'DraggableTask';