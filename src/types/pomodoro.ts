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
  pomodoroSessionId?: number;
  parentTaskTitle?: string | null;
  grandParentTaskTitle?: string | null;
  groupName?: string | null;
}