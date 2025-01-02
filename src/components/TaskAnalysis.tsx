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
  Briefcase,
  User,
  AlertTriangle,
  LightbulbIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface TaskAnalysisProps {
  tasks: {
    title: string;
    priority: "high" | "low" | "urgent" | "medium";
    group?: string;
    context?: "work" | "personal";
    dependencies?: string[];
    completed?: boolean;
  }[];
}

export const TaskAnalysis = ({ tasks }: TaskAnalysisProps) => {
  const urgentTasks = tasks.filter((task) => task.priority === "urgent");
  const highPriorityTasks = tasks.filter((task) => task.priority === "high");
  const mediumPriorityTasks = tasks.filter((task) => task.priority === "medium");
  const lowPriorityTasks = tasks.filter((task) => task.priority === "low");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-600";
      case "high":
        return "border-l-orange-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-blue-500";
      default:
        return "border-l-gray-500";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "high":
        return <Star className="h-5 w-5 text-orange-500" />;
      case "medium":
        return <Flag className="h-5 w-5 text-yellow-500" />;
      case "low":
        return <ListTodo className="h-5 w-5 text-blue-500" />;
      default:
        return <Flag className="h-5 w-5 text-gray-500" />;
    }
  };

  const TaskCard = ({ task }: { task: TaskAnalysisProps["tasks"][0] }) => (
    <Card className={cn(
      "mb-4 transition-all duration-200 border-l-4",
      getPriorityColor(task.priority)
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPriorityIcon(task.priority)}
            <CardTitle className="text-lg">{task.title}</CardTitle>
          </div>
          {task.completed && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </div>
        <div className="flex gap-2">
          {task.group && (
            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
              <Folder className="h-4 w-4" />
              {task.group}
            </Badge>
          )}
          {task.context && (
            <Badge variant="outline" className="flex items-center gap-1 w-fit">
              {task.context === "work" ? (
                <Briefcase className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
              {task.context === "work" ? "仕事" : "個人"}
            </Badge>
          )}
        </div>
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

  const RecommendationCard = ({ title, description }: { title: string; description: string }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <LightbulbIcon className="h-5 w-5 text-yellow-500" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] px-4">
      <div className="space-y-8">
        {urgentTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold">緊急タスク</h2>
            </div>
            {urgentTasks.map((task, index) => (
              <TaskCard key={index} task={task} />
            ))}
          </div>
        )}

        {highPriorityTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold">優先度の高いタスク</h2>
            </div>
            {highPriorityTasks.map((task, index) => (
              <TaskCard key={index} task={task} />
            ))}
          </div>
        )}

        {mediumPriorityTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flag className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">優先度が中程度のタスク</h2>
            </div>
            {mediumPriorityTasks.map((task, index) => (
              <TaskCard key={index} task={task} />
            ))}
          </div>
        )}

        {lowPriorityTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ListTodo className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold">優先度の低いタスク</h2>
            </div>
            {lowPriorityTasks.map((task, index) => (
              <TaskCard key={index} task={task} />
            ))}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-4">
            <LightbulbIcon className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">推奨事項</h2>
          </div>
          <RecommendationCard
            title="緊急タスクの優先"
            description="緊急タスクから取り組み、重要な期限を守りましょう。"
          />
          <RecommendationCard
            title="プロジェクト別のグループ化"
            description="関連タスクを一括して完了させることで、効率的に作業を進められます。"
          />
          <RecommendationCard
            title="サブタスクへの分割"
            description="大きなタスクは小さく分割することで、より管理しやすくなります。"
          />
          <RecommendationCard
            title="依存関係の考慮"
            description="タスクの依存関係を考慮して、最適な実行順序を計画しましょう。"
          />
          <RecommendationCard
            title="定期的な進捗確認"
            description="進捗状況を定期的に確認し、必要に応じて計画を調整します。"
          />
        </div>
      </div>
    </ScrollArea>
  );
};