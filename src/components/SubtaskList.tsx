import { Task } from "@/types/models";
import { DraggableTask } from "./DraggableTask";
import { SubtaskContainer } from "./subtask/SubtaskContainer";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface SubtaskListProps {
  parentTask: Task;
  subtasks: Task[];
  editingTaskId: number | null;
  addingSubtaskId: number | null;
  setEditingTaskId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
  toggleTask: (id: number, parentId?: number) => void;
  updateTaskTitle: (id: number, title: string, parentId?: number) => void;
  deleteTask: (id: number, parentId?: number) => void;
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: (groupId?: number, parentId?: number) => void;
  onReorderSubtasks?: (startIndex: number, endIndex: number, parentId: number) => void;
  isCollapsed?: boolean;
}

export const SubtaskList = ({
  parentTask,
  subtasks,
  editingTaskId,
  addingSubtaskId,
  setEditingTaskId,
  setAddingSubtaskId,
  toggleTask,
  updateTaskTitle,
  deleteTask,
  newTask,
  setNewTask,
  addTask,
  onReorderSubtasks,
  isCollapsed,
}: SubtaskListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !subtasks) return;

    if (active.id !== over.id) {
      const oldIndex = subtasks.findIndex(task => task.id.toString() === active.id);
      const newIndex = subtasks.findIndex(task => task.id.toString() === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1 && onReorderSubtasks) {
        console.log('Reordering subtasks:', {
          startIndex: oldIndex,
          endIndex: newIndex,
          parentId: parentTask.id
        });
        onReorderSubtasks(oldIndex, newIndex, parentTask.id);
      }
    }
  };

  const shouldRenderSubtasks = () => {
    if (addingSubtaskId === parentTask.id) {
      return true;
    }

    if (!subtasks || subtasks.length === 0) {
      return false;
    }
    
    if (isCollapsed) {
      return false;
    }

    if (parentTask.level >= 4) {
      return false;
    }

    return true;
  };

  if (!shouldRenderSubtasks()) {
    return null;
  }

  return (
    <SubtaskContainer onClick={(e) => e.stopPropagation()}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={subtasks.map(task => task.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {subtasks.map(subtask => (
            <DraggableTask
              key={subtask.id}
              task={subtask}
              parentTask={parentTask}
              editingTaskId={editingTaskId}
              addingSubtaskId={addingSubtaskId}
              setEditingTaskId={setEditingTaskId}
              setAddingSubtaskId={setAddingSubtaskId}
              toggleTask={toggleTask}
              updateTaskTitle={updateTaskTitle}
              deleteTask={deleteTask}
              newTask={newTask}
              setNewTask={setNewTask}
              addTask={addTask}
              onReorderSubtasks={onReorderSubtasks}
            />
          ))}
        </SortableContext>
      </DndContext>
    </SubtaskContainer>
  );
};