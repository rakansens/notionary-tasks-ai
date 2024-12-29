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
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-notion-border">
        <h2 className="text-xl font-semibold text-notion-primary">タスク管理</h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 p-3 rounded-lg hover:bg-notion-hover group"
            >
              <Button
                variant="ghost"
                size="icon"
                className={`h-5 w-5 rounded-sm border ${
                  task.completed ? "bg-blue-500 border-blue-500" : "border-gray-300"
                }`}
                onClick={() => toggleTask(task.id)}
              >
                {task.completed && <Check className="h-3 w-3 text-white" />}
              </Button>
              
              <span
                className={`flex-1 ${
                  task.completed ? "line-through text-notion-secondary" : "text-notion-primary"
                }`}
              >
                {task.title}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
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
      
      <div className="p-4 border-t border-notion-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm border border-gray-300"
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