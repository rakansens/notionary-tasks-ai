import { TaskEventType, TaskEventData } from '@/types/taskEvents';

export const emitTaskEvent = (eventData: TaskEventData) => {
  const event = new CustomEvent('taskOperation', {
    detail: eventData
  });
  window.dispatchEvent(event);

  let logMessage = '';
  switch (eventData.type) {
    case 'TASK_ADDED':
      logMessage = `新しいタスク「${eventData.title}」を追加しました`;
      break;
    case 'SUBTASK_ADDED':
      const taskPath = [eventData.title];
      if (eventData.parentTask) {
        taskPath.unshift(eventData.parentTask);
        if (eventData.grandParentTask) {
          taskPath.unshift(eventData.grandParentTask);
        }
      }
      logMessage = `サブタスク「${taskPath.join(' → ')}」を追加しました`;
      break;
    case 'GROUP_TASK_ADDED':
      logMessage = `グループ「${eventData.groupName}」に新しいタスク「${eventData.title}」を追加しました`;
      break;
    case 'TASK_COMPLETED':
    case 'SUBTASK_COMPLETED':
      const location = eventData.groupName ? `グループ「${eventData.groupName}」内の` : '';
      const taskHierarchy = [];
      if (eventData.grandParentTask) taskHierarchy.push(eventData.grandParentTask);
      if (eventData.parentTask) taskHierarchy.push(eventData.parentTask);
      taskHierarchy.push(eventData.title);
      
      const relation = taskHierarchy.length > 1 
        ? `${eventData.isSubtask ? 'サブタスク' : 'タスク'}「${taskHierarchy.join(' → ')}」`
        : `タスク「${eventData.title}」`;
      
      logMessage = `${location}${relation}を${eventData.message?.includes('未完了') ? '未完了' : '完了'}にしました`;
      break;
    default:
      logMessage = eventData.message || `Task event emitted: ${JSON.stringify(eventData)}`;
  }

  console.log(logMessage);
};

export const createTaskEvent = (
  type: TaskEventType,
  title: string,
  parentTask?: string,
  groupName?: string,
  message?: string,
  grandParentTask?: string,
  isSubtask?: boolean
): TaskEventData => ({
  type,
  title,
  parentTask,
  groupName,
  message,
  grandParentTask,
  isSubtask,
  timestamp: new Date()
});