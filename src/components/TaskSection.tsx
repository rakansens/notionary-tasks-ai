import { TaskDndProvider } from "./providers/TaskDndProvider";
import { TaskStateProvider } from "./providers/TaskStateProvider";
import { TaskUI } from "./task/TaskUI";

export const TaskSection = () => {
  return (
    <TaskStateProvider>
      <TaskDndProvider>
        <TaskUI />
      </TaskDndProvider>
    </TaskStateProvider>
  );
};