export interface PomodoroSession {
  id: number;
  name: string;
  startTime: Date;
  endTime?: Date;
  completedTasks: CompletedTask[];
}

export interface CompletedTask {
  id: number;
  title: string;
  completedAt: Date;
  addedAt: Date;
  status: 'completed' | 'pending' | 'in-progress';
  pomodoroSessionId?: number;
  parentTaskTitle?: string | null;
  grandParentTaskTitle?: string | null;
  groupName?: string | null;
  eventType?: 'task_added' | 'task_deleted' | 'pomodoro_started' | 'break_started' | 'break_ended';
  description?: string;
}