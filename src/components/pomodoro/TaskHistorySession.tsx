import { format } from "date-fns";
import { TaskHistoryItem } from "./TaskHistoryItem";
import { PomodoroSession } from "@/types/pomodoro";

interface TaskHistorySessionProps {
  session: PomodoroSession;
  currentSession: PomodoroSession | null;
  newTasks: any[];
  editingTaskId: number | null;
  editingTitle: string;
  editingTime: string;
  onEditStart: (taskId: number, currentTitle: string) => void;
  onEditComplete: () => void;
  onTimeEdit: (taskId: number, currentTime: Date) => void;
  onTimeUpdate: (taskId: number, newTime: string) => void;
  setEditingTitle: (title: string) => void;
  setEditingTime: (time: string) => void;
}

export const TaskHistorySession = ({
  session,
  currentSession,
  newTasks,
  editingTaskId,
  editingTitle,
  editingTime,
  onEditStart,
  onEditComplete,
  onTimeEdit,
  onTimeUpdate,
  setEditingTitle,
  setEditingTime
}: TaskHistorySessionProps) => {
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

  const isTaskFromCurrentSession = (task: any) => {
    return currentSession && session.id === currentSession.id;
  };

  return (
    <div className="border-b border-notion-border last:border-b-0">
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
        {allTasks.map((task, index) => (
          <TaskHistoryItem
            key={`${task.id}-${index}`}
            task={task}
            isCurrentSession={isTaskFromCurrentSession(task)}
            editingTaskId={editingTaskId}
            editingTitle={editingTitle}
            editingTime={editingTime}
            onEditStart={onEditStart}
            onEditComplete={onEditComplete}
            onTimeEdit={onTimeEdit}
            onTimeUpdate={onTimeUpdate}
            setEditingTitle={setEditingTitle}
            setEditingTime={setEditingTime}
          />
        ))}
      </div>
    </div>
  );
};