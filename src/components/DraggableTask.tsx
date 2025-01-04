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

    // 詳細なデバッグ情報
    console.log('Task hierarchy detailed check:', {
      taskId: task.id,
      taskTitle: task.title,
      taskLevel: currentLevel,
      parentTaskId: parentTask?.id,
      parentTaskTitle: parentTask?.title,
      parentTaskLevel: parentTask?.level,
      hasSubtasks,
      subtasksCount: subtasks.length,
      isCollapsed,
      subtasks: subtasks.map(st => ({
        id: st.id,
        title: st.title,
        level: st.level,
        parentId: st.parentId
      }))
    });

    // 基本的な条件チェック
    if (isCollapsed || !hasSubtasks) {
      console.log('Basic check failed:', { isCollapsed, hasSubtasks });
      return false;
    }

    // レベル制限チェック（3階層まで）
    if (currentLevel >= 3) {
      console.log('Maximum level reached:', currentLevel);
      return false;
    }

    // 親タスクの存在チェックと整合性の確認
    if (parentTask) {
      const parentLevel = parentTask.level || 1;
      
      // 親子関係の整合性チェック
      if (currentLevel <= parentLevel) {
        console.warn('Invalid parent-child level hierarchy:', {
          taskId: task.id,
          taskLevel: currentLevel,
          parentId: parentTask.id,
          parentLevel
        });
        return false;
      }
    }

    // サブタスクの整合性チェック
    const hasValidSubtasks = subtasks.every(subtask => {
      const subtaskLevel = subtask.level || 1;
      const expectedLevel = currentLevel + 1;
      const hasValidParent = subtask.parentId === task.id;
      const isValidLevel = subtaskLevel === expectedLevel;

      if (!isValidLevel || !hasValidParent) {
        console.warn('Invalid subtask configuration:', {
          subtaskId: subtask.id,
          subtaskTitle: subtask.title,
          subtaskLevel,
          expectedLevel,
          parentId: task.id,
          actualParentId: subtask.parentId,
          reason: !isValidLevel ? 'Invalid level' : 'Invalid parent'
        });
        return false;
      }
      return true;
    });

    if (!hasValidSubtasks) {
      console.log('No valid subtasks found');
      return false;
    }

    return true;
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