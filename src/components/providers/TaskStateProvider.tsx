import { ReactNode } from "react";
import { useTaskManager } from "@/hooks/taskManager/useTaskManager";
import { TaskContext } from "@/contexts/TaskContext";

interface TaskStateProviderProps {
  children: ReactNode;
}

export const TaskStateProvider = ({ children }: TaskStateProviderProps) => {
  const taskManager = useTaskManager();

  return (
    <TaskContext.Provider 
      value={{
        ...taskManager,
        handleReorderSubtasks: (startIndex: number, endIndex: number, parentId: number) => {
          // Implement reorder logic here if needed
          console.log("Reordering subtasks:", { startIndex, endIndex, parentId });
        },
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};