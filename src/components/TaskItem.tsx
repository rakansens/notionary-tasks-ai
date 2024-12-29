import { Check, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Task } from "@/hooks/useTaskManager";

interface TaskItemProps {
  task: Task;
  editingTaskId: number | null;
  setEditingTaskId: (id: number | null) => void;
  toggleTask: (id: number) => void;
  updateTaskTitle: (id: number, title: string) => void;
  deleteTask: (id: number) => void;
}

export const TaskItem = ({
  task,
  editingTaskId,
  setEditingTaskId,
  toggleTask,
  updateTaskTitle,
  deleteTask,
}: TaskItemProps) => {
  return (
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
          task.completed ? "bg-primary border-primary" : "border-input"
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
          className="flex-1 h-6 py-0"
          autoFocus
        />
      ) : (
        <span
          className={cn(
            "flex-1 transition-all duration-200 cursor-pointer",
            task.completed && "line-through text-muted-foreground"
          )}
          onClick={() => setEditingTaskId(task.id)}
        >
          {task.title}
        </span>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => deleteTask(task.id)}>
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};