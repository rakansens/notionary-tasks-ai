import { useState } from "react";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import type { Task, Group } from "./useTaskManager";

interface DragAndDropState {
  activeId: string | null;
}

type UpdateTaskOrderFn = (taskId: number, newGroupId?: number, newIndex?: number) => void;

export const useDragAndDrop = (
  tasks: Task[],
  groups: Group[],
  updateTaskOrder: UpdateTaskOrderFn
) => {
  const [state, setState] = useState<DragAndDropState>({
    activeId: null,
  });

  const handleDragStart = (event: DragStartEvent) => {
    setState({ activeId: String(event.active.id) });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setState({ activeId: null });
      return;
    }

    const activeId = Number(active.id);
    const overId = Number(over.id);
    
    if (activeId === overId) {
      setState({ activeId: null });
      return;
    }

    const activeTask = tasks.find(task => task.id === activeId);
    const overTask = tasks.find(task => task.id === overId);
    
    if (!activeTask) {
      setState({ activeId: null });
      return;
    }

    // Calculate new index and group
    const newGroupId = overTask?.groupId;
    const tasksInTargetArea = tasks.filter(task => {
      if (newGroupId) {
        // グループ内のタスクの場合
        return task.groupId === newGroupId && !task.parentId;
      } else {
        // グループ外のタスクの場合
        return !task.groupId && !task.parentId;
      }
    }).sort((a, b) => a.order - b.order);

    const overIndex = tasksInTargetArea.findIndex(task => task.id === overId);
    
    // Update task order
    const updatedTasks = [...tasks];
    const taskToMove = updatedTasks.find(t => t.id === activeId);
    if (!taskToMove) return;

    // Remove task from current position
    const filteredTasks = updatedTasks.filter(t => t.id !== activeId);

    // Update task's group and order
    taskToMove.groupId = newGroupId;
    
    // Calculate new order
    if (overIndex >= 0) {
      const targetTask = tasksInTargetArea[overIndex];
      const newOrder = targetTask.order;
      
      // Shift orders of tasks after the target position
      filteredTasks.forEach(task => {
        if ((task.groupId === newGroupId || (!task.groupId && !newGroupId)) && 
            task.order >= newOrder) {
          task.order += 1;
        }
      });
      
      taskToMove.order = newOrder;
    } else {
      // Add to the end
      const maxOrder = Math.max(...tasksInTargetArea.map(t => t.order), -1);
      taskToMove.order = maxOrder + 1;
    }

    // Insert task at new position
    filteredTasks.push(taskToMove);

    // Sort tasks by order
    const sortedTasks = filteredTasks.sort((a, b) => {
      if (a.groupId === b.groupId) {
        return a.order - b.order;
      }
      return 0;
    });

    updateTaskOrder(sortedTasks);
    setState({ activeId: null });
  };

  const handleDragCancel = () => {
    setState({ activeId: null });
  };

  return {
    dragAndDropState: state,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};