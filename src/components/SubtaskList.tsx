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
            title: parentTask.title,
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
      console.log('No subtasks found for parent:', {
        parentId: parentTask.id,
        parentTitle: parentTask.title
      });
      return false;
    }
    
    if (isCollapsed) {
      console.log('Parent task is collapsed:', parentTask.id);
      return false;
    }

    const parentLevel = parentTask.level || 1;
    
    // サブタスクの検証（より詳細なログ）
    const validSubtasks = subtasks.filter(subtask => {
      const subtaskLevel = subtask.level || 1;
      const isValidLevel = subtaskLevel === parentLevel + 1;
      const hasValidParent = subtask.parentId === parentTask.id;

      console.log('Validating subtask:', {
        subtaskId: subtask.id,
        subtaskTitle: subtask.title,
        subtaskLevel,
        expectedLevel: parentLevel + 1,
        parentTaskId: parentTask.id,
        parentTaskTitle: parentTask.title,
        actualParentId: subtask.parentId,
        isValidLevel,
        hasValidParent
      });

      if (!isValidLevel || !hasValidParent) {
        console.warn('Invalid subtask found:', {
          reason: !isValidLevel ? 'Invalid level' : 'Invalid parent',
          subtask: {
            id: subtask.id,
            title: subtask.title,
            level: subtaskLevel,
            parentId: subtask.parentId
          },
          parent: {
            id: parentTask.id,
            title: parentTask.title,
            level: parentLevel
          }
        });
        return false;
      }
      return true;
    });

    // 有効なサブタスクが存在しない場合は表示しない
    if (validSubtasks.length === 0) {
      console.log('No valid subtasks found after filtering for parent:', {
        parentId: parentTask.id,
        parentTitle: parentTask.title
      });
      return false;
    }

    return true;
  };

  if (!shouldRenderSubtasks()) return null;

  // 有効なサブタスクのみをフィルタリング
  const validSubtasks = subtasks.filter(subtask => {
    const isValidLevel = (subtask.level || 1) === (parentTask.level || 1) + 1;
    const hasValidParent = subtask.parentId === parentTask.id;
    return isValidLevel && hasValidParent;
  });

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