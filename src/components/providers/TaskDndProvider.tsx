import { ReactNode } from "react";
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Task, Group } from "@/types/models";

interface TaskDndProviderProps {
  children: ReactNode;
  tasks: Task[];
  groups: Group[];
  updateTaskOrder: (tasks: Task[]) => void;
  updateGroupOrder?: (groups: Group[]) => void;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
}

export const TaskDndProvider = ({
  children,
  onDragStart,
  onDragEnd,
  onDragCancel,
}: TaskDndProviderProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
      modifiers={[restrictToVerticalAxis]}
    >
      {children}
    </DndContext>
  );
};