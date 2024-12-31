import { TaskLogTabs } from "./pomodoro/TaskLogTabs";
import { Card } from "./ui/card";

export const TaskSection = () => {
  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <Card className="flex-1 p-4">
        <TaskLogTabs />
      </Card>
    </div>
  );
};