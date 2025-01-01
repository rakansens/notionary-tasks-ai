import { History, Folder, ArrowRight, CheckCircle, PlusCircle, Clock, Trash2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { PomodoroSession } from "@/types/pomodoro";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";

interface CompletedTasksProps {
  sessions: PomodoroSession[];
  currentSession: PomodoroSession | null;
  onAddCompletedTask: (task: any) => void;
}

export const CompletedTasks = ({ sessions, currentSession, onAddCompletedTask }: CompletedTasksProps) => {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingTime, setEditingTime] = useState<string>("");
  const [newTasks, setNewTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const handleTaskActivity = (event: CustomEvent) => {
      if (currentSession) {
        const activity = {
          ...event.detail,
          sessionId: currentSession.id
        };
        setActivities(prev => [...prev, activity]);
        
        // Show toast notification based on activity type
        const messages = {
          added: `新しいタスクが追加されました: ${activity.task.title}`,
          deleted: `タスクが削除されました: ${activity.task.title}`,
          toggled: `タスクが${activity.task.completed ? '完了' : '未完了'}に変更されました: ${activity.task.title}`,
          groupAdded: `新しいグループが追加されました: ${activity.group.name}`,
          groupDeleted: `グループが削除されました: ${activity.group.name}`,
        };
        
        toast({
          title: "アクティビティ",
          description: messages[activity.type as keyof typeof messages],
        });
      }
    };

    window.addEventListener('taskActivity', handleTaskActivity as EventListener);
    return () => {
      window.removeEventListener('taskActivity', handleTaskActivity as EventListener);
    };
  }, [currentSession]);

  const handleEditStart = (taskId: number, currentTitle: string) => {
    setEditingTaskId(taskId);
    setEditingTitle(currentTitle);
  };

  const handleEditComplete = () => {
    setEditingTaskId(null);
  };

  const handleTimeEdit = (taskId: number, currentTime: Date) => {
    setEditingTime(format(currentTime, "HH:mm"));
  };

  const handleTimeUpdate = (taskId: number, newTime: string) => {
    if (!newTime) return;
    
    console.log('Updating time for task', taskId, 'to', newTime);
    toast({
      title: "時間を更新しました",
      description: `タスクの時間を ${newTime} に更新しました。`,
    });
    setEditingTime("");
  };

  const isTaskFromCurrentSession = (task: any, session: PomodoroSession) => {
    return currentSession && session.id === currentSession.id;
  };

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-notion-hover text-notion-secondary"
        >
          <History className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-notion-border z-50">
        <div className="max-h-96 overflow-y-auto">
          {sessions.map(session => {
            const sessionActivities = activities.filter(activity => activity.sessionId === session.id);
            const sessionNewTasks = newTasks.filter(task => task.sessionId === session.id);
            const allItems = [...sessionActivities, ...sessionNewTasks]
              .sort((a, b) => {
                const timeA = a.timestamp || new Date(a.addedAt);
                const timeB = b.timestamp || new Date(b.addedAt);
                return timeB.getTime() - timeA.getTime();
              });

            if (allItems.length === 0) return null;

            return (
              <div key={session.id} className="border-b border-notion-border last:border-b-0">
                <div className="px-4 py-3 bg-[#F7F7F7]">
                  <h3 className="text-sm font-medium text-notion-primary flex items-center justify-between">
                    <span>{session.name}</span>
                    <span className="text-notion-secondary text-xs">
                      {format(session.startTime, "M/d HH:mm")}
                      {session.endTime && ` - ${format(session.endTime, "HH:mm")}`}
                    </span>
                  </h3>
                </div>
                <div className="divide-y divide-notion-border">
                  {allItems.map((item, index) => (
                    <div
                      key={`${item.type}-${index}`}
                      className="px-4 py-2 transition-colors duration-200 hover:bg-notion-hover"
                    >
                      <div className="flex items-center gap-2">
                        {item.type === 'added' && <PlusCircle className="h-4 w-4 text-[#37A169]" />}
                        {item.type === 'deleted' && <Trash2 className="h-4 w-4 text-red-500" />}
                        {item.type === 'toggled' && (
                          <CheckCircle className={cn(
                            "h-4 w-4",
                            item.task.completed ? "text-[#3291FF]" : "text-gray-400"
                          )} />
                        )}
                        {item.type === 'groupAdded' && <Folder className="h-4 w-4 text-[#37A169]" />}
                        {item.type === 'groupDeleted' && (
                          <div className="flex items-center gap-1">
                            <Folder className="h-4 w-4 text-red-500" />
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </div>
                        )}
                        <span className="text-sm">
                          {item.task?.title || item.group?.name}
                          {item.task?.groupName && (
                            <span className="ml-2 text-xs text-notion-secondary">
                              (グループ: {item.task.groupName})
                            </span>
                          )}
                        </span>
                        <span className="ml-auto text-xs text-notion-secondary">
                          {format(new Date(item.timestamp), "HH:mm")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
