import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TaskInput } from "./TaskInput";
import { TaskDropdownMenu } from "./TaskDropdownMenu";
import { SubtaskList } from "./SubtaskList";
import type { Task } from "@/hooks/useTaskManager";

interface TaskItemProps {
  task: Task;
  editingTaskId: number | null;
  setEditingTaskId: (id: number | null) => void;
  toggleTask: (id: number, parentId?: number) => void;
  updateTaskTitle: (id: number, title: string, parentId?: number) => void;
  deleteTask: (id: number, parentId?: number) => void;
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: (groupId?: number, parentId?: number) => void;
}

export const TaskItem = ({
  task,
  editingTaskId,
  setEditingTaskId,
  toggleTask,
  updateTaskTitle,
  deleteTask,
  newTask,
  setNewTask,
  addTask,
}: TaskItemProps) => {
  const handleAddSubtask = () => {
    if (newTask.trim() && task.id) {
      addTask(task.groupId, task.id);
    } else {
      setEditingTaskId(task.id);
    }
  };

  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          "flex items-center gap-1 p-1.5 rounded-lg transition-all duration-200",
          "hover:bg-muted/50 group"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-5 w-5 rounded-md border transition-colors duration-200",
            task.completed ? "bg-primary border-primary" : "border-input hover:border-primary/50"
          )}
          onClick={() => toggleTask(task.id)}
        >
          {task.completed && <Check className="h-3 w-3 text-primary-foreground" />}
        </Button>
        
        {editingTaskId === task.id ? (
          <Input
            value={task.title}
            onChange={(e) => updateTaskTitle(task.id, e.target.value)}
            onBlur={() => setEditingTaskId(null)}
            onKeyPress={(e) => e.key === "Enter" && setEditingTaskId(null)}
            className="flex-1 h-6 py-0 bg-background"
            autoFocus
          />
        ) : (
          <span
            className={cn(
              "flex-1 transition-all duration-200 cursor-pointer text-sm",
              task.completed && "line-through text-muted-foreground"
            )}
            onClick={() => setEditingTaskId(task.id)}
          >
            {task.title}
          </span>
        )}

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-muted"
            onClick={handleAddSubtask}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-muted text-muted-foreground hover:text-destructive"
            onClick={() => deleteTask(task.id)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          
          <TaskDropdownMenu onDelete={() => deleteTask(task.id)} />
        </div>
      </div>

      <SubtaskList
        parentTask={task}
        subtasks={task.subtasks || []}
        editingTaskId={editingTaskId}
        setEditingTaskId={setEditingTaskId}
        toggleTask={toggleTask}
        updateTaskTitle={updateTaskTitle}
        deleteTask={deleteTask}
        newTask={newTask}
        setNewTask={setNewTask}
        addTask={addTask}
      />
    </div>
  );
};