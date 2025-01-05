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
    // 基本的な表示条件チェック
    if (isCollapsed || !subtasks || subtasks.length === 0) {
      console.log('Basic validation failed:', {
        taskId: task.id,
        isCollapsed,
        hasSubtasks: subtasks?.length > 0
      });
      return false;
    }

    // 現在のタスクのレベルを取得（デフォルトは1）
    const currentLevel = task.level || 1;
    console.log('Current task level check:', {
      taskId: task.id,
      taskTitle: task.title,
      currentLevel,
      parentInfo: parentTask ? {
        id: parentTask.id,
        title: parentTask.title,
        level: parentTask.level
      } : null
    });

    // レベル3以上のタスクにはサブタスクを表示しない
    if (currentLevel >= 3) {
      console.log('Maximum level reached:', currentLevel);
      return false;
    }

    // サブタスクの検証
    const validSubtasks = subtasks.filter(subtask => {
      // 親子関係の検証を最初に行う
      const hasValidParent = subtask.parentId === task.id;
      if (!hasValidParent) {
        console.log('Invalid parent relationship:', {
          subtaskId: subtask.id,
          subtaskParentId: subtask.parentId,
          expectedParentId: task.id
        });
        return false;
      }

      // レベルの検証
      const expectedLevel = currentLevel + 1;
      const subtaskLevel = subtask.level || 1;
      const isValidLevel = subtaskLevel === expectedLevel && subtaskLevel <= 3;

      console.log('Subtask validation:', {
        subtaskId: subtask.id,
        subtaskTitle: subtask.title,
        hasValidParent,
        isValidLevel,
        subtaskLevel,
        expectedLevel
      });

      return hasValidParent && isValidLevel;
    });

    const isValid = validSubtasks.length > 0;
    console.log('Final validation result:', {
      taskId: task.id,
      validSubtasksCount: validSubtasks.length,
      isValid,
      currentLevel,
      parentLevel: parentTask?.level
    });

    return isValid;
  }, [task, subtasks, isCollapsed, parentTask]);

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