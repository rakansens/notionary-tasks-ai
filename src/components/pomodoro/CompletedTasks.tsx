import { History } from "lucide-react";
import { format } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import { TaskEventData } from "@/types/taskEvents";
import { TaskHistorySession } from "./TaskHistorySession";
import type { PomodoroSession } from "@/types/pomodoro";

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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleTaskOperation = (event: CustomEvent<TaskEventData>) => {
      console.log('Task operation detected:', event.detail);
      if (currentSession) {
        const { type, title, parentTask, groupName } = event.detail;
        let description = '';

        switch (type) {
          case 'TASK_ADDED':
            description = `タスク「${title}」を追加しました`;
            break;
          case 'TASK_DELETED':
            description = `タスク「${title}」を削除しました`;
            break;
          case 'SUBTASK_ADDED':
            description = `「${parentTask}」のサブタスク「${title}」を追加しました`;
            break;
          case 'SUBTASK_DELETED':
            description = `「${parentTask}」のサブタスク「${title}」を削除しました`;
            break;
          case 'GROUP_ADDED':
            description = `グループ「${title}」を追加しました`;
            break;
          case 'GROUP_DELETED':
            description = `グループ「${title}」を削除しました`;
            break;
          case 'GROUP_TASK_ADDED':
            description = `グループ「${groupName}」にタスク「${title}」を追加しました`;
            break;
          case 'GROUP_TASK_DELETED':
            description = `グループ「${groupName}」からタスク「${title}」を削除しました`;
            break;
          case 'TASK_COMPLETED':
          case 'SUBTASK_COMPLETED':
            const location = groupName ? `グループ「${groupName}」内の` : '';
            const taskHierarchy = [];
            if (parentTask) taskHierarchy.push(parentTask);
            taskHierarchy.push(title);
            
            const relation = parentTask 
              ? `「${parentTask}」のサブタスク「${title}」` 
              : `タスク「${title}」`;
            description = `${location}${relation}を${event.detail.message?.includes('未完了') ? '未完了' : '完了'}にしました`;
            break;
        }

        const task = {
          id: Date.now(),
          title: description,
          originalTitle: title,
          completedAt: event.detail.timestamp,
          sessionId: currentSession.id,
          status: 'operation',
          isSubtask: type === 'SUBTASK_COMPLETED',
          parentTaskTitle: parentTask,
          groupName: groupName
        };

        setNewTasks(prev => [...prev, task]);
      }
    };

    window.addEventListener('taskOperation', handleTaskOperation as EventListener);
    
    return () => {
      window.removeEventListener('taskOperation', handleTaskOperation as EventListener);
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

  return (
    <div ref={containerRef}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
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
            {sessions.map(session => (
              <TaskHistorySession
                key={session.id}
                session={session}
                currentSession={currentSession}
                newTasks={newTasks}
                editingTaskId={editingTaskId}
                editingTitle={editingTitle}
                editingTime={editingTime}
                onEditStart={handleEditStart}
                onEditComplete={handleEditComplete}
                onTimeEdit={handleTimeEdit}
                onTimeUpdate={handleTimeUpdate}
                setEditingTitle={setEditingTitle}
                setEditingTime={setEditingTime}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};