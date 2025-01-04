import { ReactNode } from "react";
import { useTaskManager } from "@/hooks/taskManager/useTaskManager";
import { TaskContext } from "@/contexts/TaskContext";
import { Task } from "@/types/models";

interface TaskStateProviderProps {
  children: ReactNode;
}

export const TaskStateProvider = ({ children }: TaskStateProviderProps) => {
  const taskManager = useTaskManager();

  const findTaskAndSubtasks = (tasks: Task[], parentId: number): Task[] => {
    for (const task of tasks) {
      if (task.id === parentId) {
        return task.subtasks || [];
      }
      if (task.subtasks && task.subtasks.length > 0) {
        const found = findTaskAndSubtasks(task.subtasks, parentId);
        if (found.length > 0) return found;
      }
    }
    return [];
  };

  const updateTasksWithNewOrder = (tasks: Task[], parentId: number, reorderedSubtasks: Task[]): Task[] => {
    return tasks.map(task => {
      if (task.id === parentId) {
        return { ...task, subtasks: reorderedSubtasks };
      }
      if (task.subtasks && task.subtasks.length > 0) {
        return {
          ...task,
          subtasks: updateTasksWithNewOrder(task.subtasks, parentId, reorderedSubtasks)
        };
      }
      return task;
    });
  };

  return (
    <TaskContext.Provider 
      value={{
        ...taskManager,
        handleReorderSubtasks: (startIndex: number, endIndex: number, parentId: number) => {
          console.log("Reordering subtasks:", { startIndex, endIndex, parentId });
          
          const subtasks = findTaskAndSubtasks(taskManager.tasks, parentId);
          
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
          const updatedSubtasks = subtasks.map((task, index) => ({
            ...task,
            order: index
          }));
          
          // 全体のタスクツリーを更新
          const updatedTasks = updateTasksWithNewOrder(
            taskManager.tasks,
            parentId,
            updatedSubtasks
          );
          
          taskManager.updateTaskOrder(updatedTasks);
        },
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};