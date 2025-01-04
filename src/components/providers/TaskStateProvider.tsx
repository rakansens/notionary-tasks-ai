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
          
          const updatedTasks = [...taskManager.tasks];
          // parentIdを持つタスクを取得してreorder
          const subtasks = updatedTasks.filter(task => task.parentId === parentId);
          
          if (subtasks.length === 0) {
            console.warn("No subtasks found for parentId:", parentId);
            return;
          }

          // 移動するタスクを取得
          const [movedTask] = subtasks.splice(startIndex, 1);
          if (!movedTask) {
            console.warn("No task found at startIndex:", startIndex);
            return;
          }

          // 新しい位置に挿入
          subtasks.splice(endIndex, 0, movedTask);
          
          // 順序を更新
          subtasks.forEach((task, index) => {
            if (task) {
              task.order = index;
            }
          });
          
          // 親タスクのsubtasksを更新
          const parentTask = updatedTasks.find(task => task.id === parentId);
          if (parentTask) {
            parentTask.subtasks = subtasks;
          }
          
          taskManager.updateTaskOrder(updatedTasks);
        },
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};