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
import { useSubtaskValidation } from "@/hooks/task/useSubtaskValidation";

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
  const { validateSubtasks } = useSubtaskValidation();
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
          targetTask: subtasks[newIndex],
          currentOrder: subtasks.map(t => ({ id: t.id, order: t.order }))
        });
        onReorderSubtasks(oldIndex, newIndex, parentTask.id);
      }
    }
  };

  // サブタスクの検証を実行
  const validationResult = validateSubtasks(parentTask, subtasks, isCollapsed);
  console.log('Subtask validation result:', {
    parentTaskId: parentTask.id,
    parentTaskLevel: parentTask.level,
    subtasksCount: subtasks.length,
    validSubtasksCount: validationResult.validTasks.length,
    isCollapsed,
    validationDebugInfo: validationResult.debugInfo
  });

  // 検証に失敗した場合は何も表示しない
  if (!validationResult.isValid) {
    console.log('Skipping subtask rendering:', {
      parentTaskId: parentTask.id,
      reason: validationResult.debugInfo.invalidReason,
      parentLevel: parentTask.level,
      subtasksInfo: subtasks.map(t => ({
        id: t.id,
        level: t.level,
        parentId: t.parentId
      }))
    });
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
          items={validationResult.validTasks.map(task => task.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {validationResult.validTasks.map(subtask => (
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