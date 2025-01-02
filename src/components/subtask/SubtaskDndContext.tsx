import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task } from "@/hooks/useTaskManager";
import { useDragAndDrop } from "@/hooks/dragAndDrop/useDragAndDrop";

interface SubtaskDndContextProps {
  children: React.ReactNode;
  subtasks: Task[];
  parentTask: Task;
  onReorderSubtasks?: (startIndex: number, endIndex: number, parentId: number) => void;
}

export const SubtaskDndContext = ({
  children,
  subtasks,
  parentTask,
  onReorderSubtasks,
}: SubtaskDndContextProps) => {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  
  const sensors = useSensors(mouseSensor, touchSensor);

  const { handleDragStart, handleDragEnd, handleDragCancel } = useDragAndDrop(
    subtasks,
    (updatedItems) => {
      const oldIndex = subtasks.findIndex(task => task.id === updatedItems[0].id);
      const newIndex = updatedItems[0].order;
      if (oldIndex !== -1 && onReorderSubtasks) {
        onReorderSubtasks(oldIndex, newIndex, parentTask.id);
      }
    },
    {
      parentId: parentTask.id,
    }
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={subtasks.map(task => task.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
};