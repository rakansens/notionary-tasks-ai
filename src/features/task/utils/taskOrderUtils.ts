import { TaskNode } from '../types/taskTypes';
import { supabase } from '@/integrations/supabase/client';

export const reorderTasks = async (
  tasks: TaskNode[],
  sourceId: number,
  destinationId: number | null,
  destinationIndex: number
): Promise<TaskNode[]> => {
  const updatedTasks = [...tasks];
  const sourceIndex = tasks.findIndex(t => t.id === sourceId);
  
  if (sourceIndex === -1) return tasks;

  const [movedTask] = updatedTasks.splice(sourceIndex, 1);
  
  // Calculate new order position
  const newOrderPosition = calculateNewOrderPosition(
    updatedTasks,
    destinationIndex
  );

  // Update task in database
  const { error } = await supabase
    .from('tasks')
    .update({
      parent_id: destinationId,
      order_position: newOrderPosition
    })
    .eq('id', sourceId);

  if (error) {
    console.error('Error updating task order:', error);
    throw error;
  }

  // Update local state
  movedTask.parentId = destinationId;
  movedTask.order = newOrderPosition;
  updatedTasks.splice(destinationIndex, 0, movedTask);

  return updatedTasks;
};

const calculateNewOrderPosition = (
  tasks: TaskNode[],
  destinationIndex: number
): number => {
  if (tasks.length === 0) return 0;
  
  if (destinationIndex === 0) {
    return tasks[0].order / 2;
  }
  
  if (destinationIndex >= tasks.length) {
    return tasks[tasks.length - 1].order + 1024;
  }
  
  const prevOrder = tasks[destinationIndex - 1].order;
  const nextOrder = tasks[destinationIndex].order;
  return prevOrder + (nextOrder - prevOrder) / 2;
};