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
    useSensor(PointerSensor),
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
          parentTask: {
            id: parentTask.id,
            level: parentTask.level
          },
          startIndex: oldIndex,
          endIndex: newIndex,
          movedTask: subtasks[oldIndex],
          targetTask: subtasks[newIndex]
        });
        onReorderSubtasks(oldIndex, newIndex, parentTask.id);
      }
    }
  };

  const shouldRenderSubtasks = () => {
    if (!subtasks || subtasks.length === 0) {
      console.log('No subtasks found for parent:', parentTask.id);
      return false;
    }
    
    if (isCollapsed) return false;

    const parentLevel = parentTask.level || 1;
    
    // サブタスクの検証
    const validSubtasks = subtasks.filter(subtask => {
      const subtaskLevel = subtask.level || 1;
      const isValidLevel = subtaskLevel === parentLevel + 1;
      const hasValidParent = subtask.parentId === parentTask.id;

      if (!isValidLevel || !hasValidParent) {
        console.warn('Filtering out invalid subtask:', {
          subtaskId: subtask.id,
          subtaskLevel,
          parentLevel,
          parentId: parentTask.id,
          actualParentId: subtask.parentId,
          reason: !isValidLevel ? 'Invalid level' : 'Invalid parent'
        });
        return false;
      }
      return true;
    });

    // 有効なサブタスクが存在しない場合は表示しない
    if (validSubtasks.length === 0) {
      console.log('No valid subtasks found after filtering');
      return false;
    }

    return true;
  };

  if (!shouldRenderSubtasks()) return null;

  // 有効なサブタスクのみをフィルタリング
  const validSubtasks = subtasks.filter(subtask => 
    (subtask.level || 1) === (parentTask.level || 1) + 1 && 
    subtask.parentId === parentTask.id
  );

  return (
    <SubtaskContainer onClick={(e) => e.stopPropagation()}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={validSubtasks.map(task => task.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {validSubtasks.map(subtask => (
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