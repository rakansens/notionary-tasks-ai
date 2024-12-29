import { useState } from "react";
import { Plus, MoreHorizontal, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export const TaskSection = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now(),
      title: newTask,
      completed: false,
    };
    
    setTasks([...tasks, task]);
    setNewTask("");
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-2 border-b">
        <h2 className="text-xl font-semibold text-foreground">タスク管理</h2>
      </div>
      
      <ScrollArea className="flex-1 p-1">
        <div className="space-y-0.5">
          {tasks.map((task) => (
            <div
              key={task.id}
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
              
              <span
                className={cn(
                  "flex-1 transition-all duration-200",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </span>
              
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
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-2 border-t">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-md border border-input"
            onClick={addTask}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            placeholder="新しいタスクを追加..."
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};