import { Task } from "@/hooks/useTaskManager";
import { TaskCheckbox } from "./task/TaskCheckbox";
import { TaskTitle } from "./task/TaskTitle";
import { TaskItemActions } from "./task/TaskItemActions";
import { Input } from "@/components/ui/input";
import { GripVertical } from "lucide-react";

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
  dragHandleProps?: Record<string, any>;
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
  dragHandleProps,
}: TaskItemProps) => {
  const isEditing = editingTaskId === task.id;
  const isAddingSubtask = addingSubtaskId === task.id;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setEditingTaskId(null);
    }
  };

  return (
    <div className="group flex items-center gap-2 py-0.5">
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="touch-none cursor-grab p-2 hover:bg-notion-hover rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <GripVertical className="h-4 w-4 text-notion-secondary" />
        </div>
      )}
      
      <TaskCheckbox
        completed={task.completed}
        onClick={() => toggleTask(task.id, parentTask?.id)}
      />

      <div className="flex-1 min-w-0">
        <TaskTitle
          title={task.title}
          completed={task.completed}
          isEditing={isEditing}
          onTitleChange={(title) => updateTaskTitle(task.id, title, parentTask?.id)}
          onTitleClick={() => setEditingTaskId(task.id)}
          onBlur={() => setEditingTaskId(null)}
          onKeyPress={handleKeyDown}
        />
        
        {isAddingSubtask && (
          <div className="pl-6 mt-1">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onBlur={() => setAddingSubtaskId(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
                  e.preventDefault();
                  if (newTask.trim()) {
                    addTask(undefined, task.id);
                    setAddingSubtaskId(null);
                  }
                }
              }}
              placeholder="新しいサブタスク"
              className="h-6 text-sm"
              autoFocus
            />
          </div>
        )}
      </div>

      <TaskItemActions
        onAddSubtask={() => setAddingSubtaskId(task.id)}
        onDelete={() => deleteTask(task.id, parentTask?.id)}
        onDropdownDelete={() => deleteTask(task.id, parentTask?.id)}
      />
    </div>
  );
};
