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
          console.log("Reordering subtasks:", { startIndex, endIndex, parentId });
          // 実際のreorder処理をここに実装
          const updatedTasks = [...taskManager.tasks];
          // parentIdを持つタスクを取得してreorder
          const subtasks = updatedTasks.filter(task => task.parentId === parentId);
          const [movedTask] = subtasks.splice(startIndex, 1);
          subtasks.splice(endIndex, 0, movedTask);
          
          // 順序を更新
          subtasks.forEach((task, index) => {
            task.order = index;
          });
          
          taskManager.updateTaskOrder(updatedTasks);
        },
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};