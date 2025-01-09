import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { Task } from "../../types/models";
import { calculateNewOrder } from "./utils";

export const handleTaskDragStart = (
  event: DragStartEvent,
  setActiveId: (id: string | null) => void
) => {
  setActiveId(String(event.active.id));
};

export const handleTaskDragEnd = (
  event: DragEndEvent,
  tasks: Task[],
  updateOrder: (items: Task[]) => void,
  setActiveId: (id: string | null) => void
) => {
  const { active, over } = event;
  
  if (!over) {
    setActiveId(null);
    return;
  }

  const activeId = active.id.toString();
  const overId = over.id.toString();
  
  if (activeId === overId) {
    setActiveId(null);
    return;
  }

  const activeTask = tasks.find(task => task.id.toString() === activeId);
  const overTask = tasks.find(task => task.id.toString() === overId);

  if (!activeTask || !overTask) {
    setActiveId(null);
    return;
  }

  const updates = calculateNewOrder(activeTask, overTask, tasks);
  const updatedTasks = tasks.map(task => {
    const update = updates.find(u => u.id === task.id);
    if (update) {
      return {
        ...task,
        order: update.order,
        parentId: update.parentId,
        level: update.level,
        subtasks: update.subtasks || task.subtasks,
      };
    }
    return task;
  });

  updateOrder(updatedTasks);
  setActiveId(null);
};

export const handleTaskDragCancel = (
  setActiveId: (id: string | null) => void
) => {
  setActiveId(null);
};

export const handleTaskDragOver = (
  event: DragEndEvent,
  tasks: Task[],
  setDropTarget: (task: Task | null) => void
) => {
  const { over } = event;
  if (!over) {
    setDropTarget(null);
    return;
  }

  const overTask = tasks.find(task => task.id.toString() === over.id.toString());
  if (overTask) {
    setDropTarget(overTask);
  }
};