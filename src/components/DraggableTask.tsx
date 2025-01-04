import { Task } from "@/types/models";
import { TaskDragWrapper } from "./task/TaskDragWrapper";
import { TaskContainer } from "./task/TaskContainer";
import { memo } from "react";

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

export const DraggableTask = memo((props: DraggableTaskProps) => {
  console.log(`DraggableTask: Rendering task ${props.task.id}`);
  
  return (
    <TaskDragWrapper task={props.task} parentTask={props.parentTask}>
      {(dragHandleProps) => (
        <TaskContainer {...props} dragHandleProps={dragHandleProps} />
      )}
    </TaskDragWrapper>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.completed === nextProps.task.completed &&
    prevProps.editingTaskId === nextProps.editingTaskId &&
    prevProps.addingSubtaskId === nextProps.addingSubtaskId &&
    prevProps.task.order === nextProps.task.order // orderの変更も監視
  );
});

DraggableTask.displayName = 'DraggableTask';