import { History } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { TaskListItem } from "./completed-tasks/TaskListItem";
import { SessionHeader } from "./completed-tasks/SessionHeader";
import type { PomodoroSession } from "@/types/pomodoro";

interface CompletedTasksProps {
  sessions: PomodoroSession[];
  currentSession: PomodoroSession | null;
  onAddCompletedTask: (task: any) => void;
}

export const CompletedTasks = ({ 
  sessions, 
  currentSession, 
  onAddCompletedTask 
}: CompletedTasksProps) => {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingTime, setEditingTime] = useState<string>("");
  const [newTasks, setNewTasks] = useState<any[]>([]);

  useEffect(() => {
    const handleNewTask = (event: CustomEvent) => {
      if (currentSession) {
        const task = {
          ...event.detail,
          status: 'new',
          sessionId: currentSession.id,
          groupName: event.detail.groupName || null,
          parentTaskTitle: event.detail.parentTaskTitle || null,
        };
        setNewTasks(prev => [...prev, task]);
      }
    };

    window.addEventListener('taskAdded', handleNewTask as EventListener);
    return () => {
      window.removeEventListener('taskAdded', handleNewTask as EventListener);
    };
  }, [currentSession]);

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
            const sessionNewTasks = newTasks.filter(task => task.sessionId === session.id);
            const allTasks = [
              ...session.completedTasks,
              ...sessionNewTasks
            ].sort((a, b) => {
              const timeA = a.completedAt || new Date(a.addedAt);
              const timeB = b.completedAt || new Date(b.addedAt);
              return timeA.getTime() - timeB.getTime();
            });

            if (allTasks.length === 0) return null;

            return (
              <div key={session.id} className="border-b border-notion-border last:border-b-0">
                <SessionHeader session={session} />
                <div className="divide-y divide-notion-border">
                  {allTasks.map((task, index) => (
                    <TaskListItem
                      key={`${task.id}-${index}`}
                      task={task}
                      editingTaskId={editingTaskId}
                      editingTitle={editingTitle}
                      editingTime={editingTime}
                      setEditingTaskId={setEditingTaskId}
                      setEditingTitle={setEditingTitle}
                      setEditingTime={setEditingTime}
                      isTaskFromCurrentSession={isTaskFromCurrentSession}
                      session={session}
                    />
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