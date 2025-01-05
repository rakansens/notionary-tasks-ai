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
    console.log('Checking subtasks render condition:', {
      taskId: task.id,
      taskTitle: task.title,
      isCollapsed,
      subtasksCount: subtasks.length,
      taskLevel: task.level,
      parentTaskLevel: parentTask?.level
    });

    if (isCollapsed) {
      console.log('Task is collapsed, not rendering subtasks');
      return false;
    }

    if (!subtasks || subtasks.length === 0) {
      console.log('No subtasks available');
      return false;
    }

    // 現在のタスクのレベルを取得（デフォルトは1）
    const currentLevel = task.level || 1;

    // レベル3以上のタスクにはサブタスクを表示しない
    if (currentLevel >= 3) {
      console.log('Task level is too deep:', currentLevel);
      return false;
    }

    // サブタスクの検証（各サブタスクを個別に検証）
    const hasValidSubtasks = subtasks.some(subtask => {
      // 親子関係の検証
      const hasValidParent = subtask.parentId === task.id;
      
      // レベルの検証
      const subtaskLevel = subtask.level || 1;
      const hasValidLevel = subtaskLevel === currentLevel + 1;

      console.log('Validating subtask:', {
        subtaskId: subtask.id,
        subtaskTitle: subtask.title,
        subtaskLevel,
        currentLevel,
        hasValidParent,
        hasValidLevel,
        parentId: subtask.parentId,
        expectedParentId: task.id
      });

      return hasValidParent && hasValidLevel;
    });

    console.log('Validation complete:', {
      taskId: task.id,
      hasValidSubtasks,
      subtasksCount: subtasks.length
    });

    return hasValidSubtasks;
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