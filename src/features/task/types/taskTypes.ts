import { Task as SupabaseTask } from '@/types/models';

export interface TaskNode extends SupabaseTask {
  children: TaskNode[];
  depth: number;
  parentId: number | null;
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