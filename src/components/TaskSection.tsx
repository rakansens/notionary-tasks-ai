import { TaskDndProvider } from "./providers/TaskDndProvider";
import { TaskStateProvider } from "./providers/TaskStateProvider";
import { TaskUI } from "./task/TaskUI";

export const TaskSection = () => {
  return (
    <TaskStateProvider>
      <TaskSectionContent />
    </TaskStateProvider>
  );
};

const TaskSectionContent = () => {
  const { tasks, groups, updateTaskOrder } = useTaskContext();
  const {
    dragAndDropState,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop(tasks, groups, updateTaskOrder);

  return (
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
  );
};