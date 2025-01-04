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

  // サブタスクの表示条件を判定（修正）
  const canRenderSubtasks = useCallback(() => {
    // デバッグ情報の出力
    console.log('Checking subtasks for task:', {
      taskId: task.id,
      level: task.level,
      subtasksCount: subtasks.length,
      isCollapsed,
      parentTaskLevel: parentTask?.level,
      parentTaskId: parentTask?.id
    });

    // 折りたたまれている場合は表示しない
    if (isCollapsed) {
      console.log('Task is collapsed, not rendering subtasks');
      return false;
    }

    // サブタスクが存在しない場合は表示しない
    if (!subtasks.length) {
      console.log('No subtasks found');
      return false;
    }

    // 現在のタスクレベルを確認
    const currentLevel = task.level || 1;
    console.log('Current task level:', currentLevel);

    // 3階層目以上のタスクはサブタスクを持てない
    if (currentLevel >= 3) {
      console.log('Task level is too deep:', currentLevel);
      return false;
    }

    // 親タスクがある場合、親タスクのレベルを確認
    if (parentTask) {
      const parentLevel = parentTask.level || 1;
      console.log('Parent task level:', parentLevel);
      
      // 親タスクのレベルが2以上の場合、サブタスクを表示しない
      if (parentLevel >= 2) {
        console.log('Parent task level is too deep:', parentLevel);
        return false;
      }
    }

    console.log('Can render subtasks:', true);
    return true;
  }, [task.level, subtasks.length, isCollapsed, task.id, parentTask]);

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