export type TaskEventType = 
  | 'TASK_ADDED' 
  | 'TASK_DELETED'
  | 'TASK_COMPLETED'
  | 'SUBTASK_ADDED'
  | 'SUBTASK_DELETED'
  | 'SUBTASK_COMPLETED'
  | 'GROUP_ADDED'
  | 'GROUP_DELETED'
  | 'GROUP_TASK_ADDED'
  | 'GROUP_TASK_DELETED';

export interface TaskEventData {
  type: TaskEventType;
  title: string;
  parentTask?: string;
  groupName?: string;
  message?: string;
  timestamp: Date;
  grandParentTask?: string;
  isSubtask?: boolean;
}