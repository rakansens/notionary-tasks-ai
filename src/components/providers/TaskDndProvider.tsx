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
  console.log("TaskDndProvider: Initializing sensors");
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // ドラッグ開始の距離を増やす
        tolerance: 5,
        delay: 0, // 遅延を削除
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  console.log("TaskDndProvider: Setting up DndContext");

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => {
        console.log("DndContext: Drag Start", event);
        onDragStart(event);
      }}
      onDragEnd={(event) => {
        console.log("DndContext: Drag End", event);
        onDragEnd(event);
      }}
      onDragCancel={() => {
        console.log("DndContext: Drag Cancel");
        onDragCancel();
      }}
      modifiers={[restrictToVerticalAxis]}
    >
      {children}
    </DndContext>
  );
};