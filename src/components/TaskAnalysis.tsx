import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Flag,
  Folder,
  ListTodo,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface TaskAnalysisProps {
  tasks: {
    title: string;
    priority: "high" | "low";
    group?: string;
    dependencies?: string[];
    completed?: boolean;
  }[];
}

export const TaskAnalysis = ({ tasks }: TaskAnalysisProps) => {
  const highPriorityTasks = tasks.filter((task) => task.priority === "high");
  const lowPriorityTasks = tasks.filter((task) => task.priority === "low");

  const TaskCard = ({ task }: { task: TaskAnalysisProps["tasks"][0] }) => (
    <Card className={cn(
      "mb-4 transition-all duration-200",
      task.priority === "high" 
        ? "border-l-4 border-l-red-500" 
        : "border-l-4 border-l-blue-500"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.priority === "high" ? (
              <Star className="h-5 w-5 text-red-500" />
            ) : (
              <Flag className="h-5 w-5 text-blue-500" />
            )}
            <CardTitle className="text-lg">{task.title}</CardTitle>
          </div>
          {task.completed && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </div>
        {task.group && (
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            <Folder className="h-4 w-4" />
            {task.group}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {task.dependencies && task.dependencies.length > 0 && (
          <div className="mt-2">
            <CardDescription className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              依存タスク:
            </CardDescription>
            <div className="ml-5 mt-1">
              {task.dependencies.map((dep, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  {dep}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] px-4">
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-semibold">優先度の高いタスク</h2>
          </div>
          {highPriorityTasks.map((task, index) => (
            <TaskCard key={index} task={task} />
          ))}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">優先度の低いタスク</h2>
          </div>
          {lowPriorityTasks.map((task, index) => (
            <TaskCard key={index} task={task} />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};