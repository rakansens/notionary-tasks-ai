import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, AlertTriangle, ArrowUp, ArrowRight, ArrowDown } from "lucide-react";
import { useTaskManager } from "@/hooks/useTaskManager";
import { useToast } from "@/components/ui/use-toast";

interface Task {
  title: string;
  priority: "urgent" | "high" | "medium" | "low";
  group?: string;
  context?: "work" | "personal";
  dependencies?: string[];
}

interface TaskAnalysisProps {
  tasks: Task[];
}

export const TaskAnalysis = ({ tasks }: TaskAnalysisProps) => {
  const { addTask } = useTaskManager();
  const { toast } = useToast();

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "high":
        return <ArrowUp className="h-4 w-4 text-orange-500" />;
      case "medium":
        return <ArrowRight className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleAddTask = (task: Task) => {
    addTask(undefined, undefined, task.title);
    toast({
      title: "タスクを追加しました",
      description: `「${task.title}」を追加しました`,
    });
  };

  return (
    <Card className="w-full p-4 space-y-4">
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-6">
          {["urgent", "high", "medium", "low"].map((priority) => {
            const priorityTasks = tasks.filter((task) => task.priority === priority);
            if (priorityTasks.length === 0) return null;

            return (
              <div key={priority} className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  {getPriorityIcon(priority)}
                  {priority === "urgent" ? "緊急タスク" :
                   priority === "high" ? "優先度の高いタスク" :
                   priority === "medium" ? "優先度の中程度のタスク" :
                   "優先度の低いタスク"}
                </h3>
                <div className="grid gap-2">
                  {priorityTasks.map((task, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getPriorityColor(priority)} flex items-center justify-between`}
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{task.title}</div>
                        <div className="flex gap-2">
                          {task.group && (
                            <Badge variant="outline" className="text-xs">
                              {task.group}
                            </Badge>
                          )}
                          {task.context && (
                            <Badge variant="outline" className="text-xs">
                              {task.context === "work" ? "仕事" : "個人"}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddTask(task)}
                        className="ml-2"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {tasks.some(task => task.dependencies && task.dependencies.length > 0) && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">依存関係</h3>
              <div className="space-y-2">
                {tasks
                  .filter(task => task.dependencies && task.dependencies.length > 0)
                  .map((task, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      「{task.title}」は、{task.dependencies?.join('、')}の完了後に実行
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};