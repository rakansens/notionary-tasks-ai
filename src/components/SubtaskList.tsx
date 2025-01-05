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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
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

        try {
          // データベースの更新
          const reorderedTasks = [...subtasks];
          const [movedTask] = reorderedTasks.splice(oldIndex, 1);
          reorderedTasks.splice(newIndex, 0, movedTask);

          // 新しい順序でタスクを更新
          const updates = reorderedTasks.map((task, index) => ({
            id: task.id,
            order_position: index,
          }));

          for (const update of updates) {
            const { error } = await supabase
              .from('tasks')
              .update({ order_position: update.order_position })
              .eq('id', update.id);

            if (error) {
              throw error;
            }
          }

          // UIの更新
          onReorderSubtasks(oldIndex, newIndex, parentTask.id);

          console.log('Order updated in database:', {
            updates,
            parentTaskId: parentTask.id
          });

        } catch (error) {
          console.error('Error updating task order:', error);
          toast({
            title: "エラー",
            description: "タスクの順序の更新に失敗しました",
            variant: "destructive",
          });
        }
      }
    }
  };

  const validationResult = validateSubtasks(parentTask, subtasks, isCollapsed);
  console.log('Subtask validation result:', validationResult.debugInfo);

  if (!validationResult.isValid) {
    console.log('Skipping subtask rendering:', validationResult.debugInfo.invalidReason);
    return null;
  }

  const sortedTasks = [...validationResult.validTasks].sort((a, b) => {
    const orderA = a.order || 0;
    const orderB = b.order || 0;
    return orderA - orderB;
  });

  return (
    <SubtaskContainer onClick={(e) => e.stopPropagation()}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedTasks.map(task => task.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {sortedTasks.map(subtask => (
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