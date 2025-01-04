import { useTaskContext } from "@/contexts/TaskContext";
import { TaskDndProvider } from "./providers/TaskDndProvider";
import { TaskStateProvider } from "./providers/TaskStateProvider";
import { TaskUI } from "./task/TaskUI";
import { useDragAndDrop } from "@/hooks/dragAndDrop/useDragAndDrop";

export const TaskSection = () => {
  const { tasks, groups, updateTaskOrder } = useTaskContext();
  const {
    dragAndDropState,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop(tasks, groups, updateTaskOrder);

  return (
    <TaskStateProvider>
      <TaskDndProvider
        tasks={tasks}
        groups={groups}
        updateTaskOrder={updateTaskOrder}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <TaskUI />
      </TaskDndProvider>
    </TaskStateProvider>
  );
};