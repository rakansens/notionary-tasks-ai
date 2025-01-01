import { DndContext, closestCenter, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task } from "@/hooks/useTaskManager";

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = subtasks.findIndex(task => task.id.toString() === active.id);
    const newIndex = subtasks.findIndex(task => task.id.toString() === over.id);

    if (oldIndex !== -1 && newIndex !== -1 && onReorderSubtasks) {
      onReorderSubtasks(oldIndex, newIndex, parentTask.id);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
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