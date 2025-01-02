import { Task } from "@/hooks/taskManager/types";
import { createContext, useContext, ReactNode } from "react";
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  KeyboardSensor,
  closestCenter
} from "@dnd-kit/core";
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

interface SubtaskDndContextProps {
  subtasks: Task[];
  parentTask: Task;
  children: ReactNode;
  onReorderSubtasks?: (startIndex: number, endIndex: number, parentId: number) => void;
}

const SubtaskDndContext = createContext<SubtaskDndContextProps | undefined>(undefined);

export const SubtaskDndProvider: React.FC<SubtaskDndContextProps> = ({ 
  children, 
  subtasks, 
  parentTask, 
  onReorderSubtasks 
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = subtasks.findIndex(task => task.id.toString() === active.id);
    const newIndex = subtasks.findIndex(task => task.id.toString() === over.id);

    if (oldIndex !== -1 && newIndex !== -1 && onReorderSubtasks) {
      console.log('Subtask reorder:', { oldIndex, newIndex, parentId: parentTask.id });
      onReorderSubtasks(oldIndex, newIndex, parentTask.id);
    }
  };

  return (
    <SubtaskDndContext.Provider value={{ subtasks, parentTask, onReorderSubtasks, children }}>
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
    </SubtaskDndContext.Provider>
  );
};

export const useSubtaskDndContext = () => {
  const context = useContext(SubtaskDndContext);
  if (!context) {
    throw new Error("useSubtaskDndContext must be used within a SubtaskDndProvider");
  }
  return context;
};