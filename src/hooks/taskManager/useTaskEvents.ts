import { Task, Group } from './types';
import { emitTaskEvent, createTaskEvent } from '@/utils/taskEventEmitter';

export const useTaskEvents = () => {
  const emitTaskAdded = (task: Task, parentTask?: Task, group?: Group, grandParentTask?: Task) => {
    emitTaskEvent(createTaskEvent(
      parentTask ? 'SUBTASK_ADDED' : group ? 'GROUP_TASK_ADDED' : 'TASK_ADDED',
      task.title,
      parentTask?.title,
      group?.name,
      undefined,
      grandParentTask?.title
    ));
  };

  const emitTaskCompleted = (task: Task, parentTask?: Task, group?: Group, grandParentTask?: Task) => {
    const location = group ? `グループ「${group.name}」内の` : '';
    const message = `${location}タスクを${!task.completed ? '完了' : '未完了'}に変更しました`;

    emitTaskEvent(createTaskEvent(
      parentTask ? 'SUBTASK_COMPLETED' : 'TASK_COMPLETED',
      task.title,
      parentTask?.title,
      group?.name,
      message,
      grandParentTask?.title,
      !!parentTask
    ));
  };

  const emitTaskDeleted = (task: Task, parentTask?: Task, group?: Group) => {
    emitTaskEvent(createTaskEvent(
      parentTask ? 'SUBTASK_DELETED' : task.groupId ? 'GROUP_TASK_DELETED' : 'TASK_DELETED',
      task.title,
      parentTask?.title,
      group?.name
    ));
  };

  const emitGroupAdded = (group: Group) => {
    emitTaskEvent(createTaskEvent('GROUP_ADDED', group.name));
  };

  const emitGroupDeleted = (group: Group) => {
    emitTaskEvent(createTaskEvent('GROUP_DELETED', group.name));
  };

  return {
    emitTaskAdded,
    emitTaskCompleted,
    emitTaskDeleted,
    emitGroupAdded,
    emitGroupDeleted,
  };
};