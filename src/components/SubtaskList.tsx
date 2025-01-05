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

type TaskOrderUpdate = {
  [key: string]: string | number;
  task_id: number;
  new_order: number;
  parent_id: number;
  level: number;
};

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
          const reorderedTasks = [...subtasks];
          const [movedTask] = reorderedTasks.splice(oldIndex, 1);
          reorderedTasks.splice(newIndex, 0, movedTask);

          // 新しい順序を計算
          const taskUpdates = reorderedTasks.map((task, index) => ({
            task_id: task.id,
            new_order: index,
            parent_id: parentTask.id,
            level: task.level || parentTask.level + 1
          }));

          console.log('Updating task orders:', {
            updates: taskUpdates,
            parentTask: parentTask,
            reorderedTasks: reorderedTasks.map(t => ({
              id: t.id,
              title: t.title,
              order: t.order,
              level: t.level
            }))
          });

          const { data, error } = await supabase.rpc('update_task_orders', {
            task_updates: taskUpdates as any[]
          });

          if (error) {
            console.error('Database error:', error);
            throw error;
          }

          console.log('Database update result:', data);

          // UIの更新
          onReorderSubtasks(oldIndex, newIndex, parentTask.id);

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