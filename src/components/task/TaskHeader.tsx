import { PomodoroHeader } from "../pomodoro/PomodoroHeader";

export const TaskHeader = () => {
  return (
    <div className="p-4 border-b border-notion-border flex items-center justify-between">
      <h2 className="text-xl font-medium text-notion-primary">タスク管理</h2>
      <PomodoroHeader />
    </div>
  );
};