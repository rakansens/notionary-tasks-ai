import { TaskState } from './taskState';
import { Task, Group } from '../types';

export type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_GROUPS'; payload: Group[] }
  | { type: 'SET_NEW_TASK'; payload: string }
  | { type: 'SET_NEW_GROUP'; payload: string }
  | { type: 'SET_IS_ADDING_GROUP'; payload: boolean }
  | { type: 'SET_EDITING_TASK_ID'; payload: number | null }
  | { type: 'SET_EDITING_GROUP_ID'; payload: number | null }
  | { type: 'SET_ADDING_SUBTASK_ID'; payload: number | null }
  | { type: 'SET_DELETE_TARGET'; payload: { type: "task" | "group"; id: number } | null }
  | { type: 'TOGGLE_GROUP_COLLAPSE'; payload: number };

export const taskStateReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };
    case 'SET_NEW_TASK':
      return { ...state, newTask: action.payload };
    case 'SET_NEW_GROUP':
      return { ...state, newGroup: action.payload };
    case 'SET_IS_ADDING_GROUP':
      return { ...state, isAddingGroup: action.payload };
    case 'SET_EDITING_TASK_ID':
      return { ...state, editingTaskId: action.payload };
    case 'SET_EDITING_GROUP_ID':
      return { ...state, editingGroupId: action.payload };
    case 'SET_ADDING_SUBTASK_ID':
      return { ...state, addingSubtaskId: action.payload };
    case 'SET_DELETE_TARGET':
      return { ...state, deleteTarget: action.payload };
    case 'TOGGLE_GROUP_COLLAPSE':
      const newCollapsedGroups = new Set(state.collapsedGroups);
      if (newCollapsedGroups.has(action.payload)) {
        newCollapsedGroups.delete(action.payload);
      } else {
        newCollapsedGroups.add(action.payload);
      }
      return { ...state, collapsedGroups: newCollapsedGroups };
    default:
      return state;
  }
};