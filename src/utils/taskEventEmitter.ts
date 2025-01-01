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
      logMessage = `タスク「${eventData.parentTask}」に新しいサブタスク「${eventData.title}」を追加しました`;
      break;
    case 'GROUP_TASK_ADDED':
      logMessage = `グループ「${eventData.groupName}」に新しいタスク「${eventData.title}」を追加しました`;
      break;
    case 'TASK_COMPLETED':
      const location = eventData.groupName ? `グループ「${eventData.groupName}」内の` : '';
      const relation = eventData.parentTask ? `サブタスク「${eventData.title}」` : `タスク「${eventData.title}」`;
      logMessage = `${location}${relation}を${eventData.message?.includes('未完了') ? '未完了' : '完了'}に変更しました`;
      break;
    case 'TASK_DELETED':
    case 'SUBTASK_DELETED':
    case 'GROUP_DELETED':
    case 'GROUP_TASK_DELETED':
      logMessage = eventData.message || `${eventData.title}を削除しました`;
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
  message?: string
): TaskEventData => ({
  type,
  title,
  parentTask,
  groupName,
  message,
  timestamp: new Date()
});