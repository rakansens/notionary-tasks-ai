export interface TaskNode {
  id: number;
  title: string;
  completed: boolean;
  order: number;
  groupId: number | null;
  parentId: number | null;
  level: number;
  addedAt: Date;
  description?: string;
  subtasks?: TaskNode[];
}

export interface TaskDragItem {
  id: number;
  type: 'TASK';
  parentId: number | null;
  level: number;
  index: number;
}

export interface TaskDropResult {
  didDrop: boolean;
  destination: {
    parentId: number | null;
    index: number;
  } | null;
}

export interface TaskValidationResult {
  isValid: boolean;
  error?: string;
}

export interface DragAndDropResult {
  dragHandleProps: Record<string, any>;
  setNodeRef: (element: HTMLElement | null) => void;
  style: Record<string, any>;
  isDragging: boolean;
}