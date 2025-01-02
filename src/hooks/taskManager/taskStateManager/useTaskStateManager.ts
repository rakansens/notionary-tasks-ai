import { useReducer } from 'react';
import { taskStateReducer } from './taskStateReducer';
import { initialTaskState } from './taskState';
import { Task, Group } from '../types';

export const useTaskStateManager = () => {
  const [state, dispatch] = useReducer(taskStateReducer, initialTaskState);

  const setTasks = (tasks: Task[]) => dispatch({ type: 'SET_TASKS', payload: tasks });
  const setGroups = (groups: Group[]) => dispatch({ type: 'SET_GROUPS', payload: groups });
  const setNewTask = (value: string) => dispatch({ type: 'SET_NEW_TASK', payload: value });
  const setNewGroup = (value: string) => dispatch({ type: 'SET_NEW_GROUP', payload: value });
  const setIsAddingGroup = (value: boolean) => dispatch({ type: 'SET_IS_ADDING_GROUP', payload: value });
  const setEditingTaskId = (id: number | null) => dispatch({ type: 'SET_EDITING_TASK_ID', payload: id });
  const setEditingGroupId = (id: number | null) => dispatch({ type: 'SET_EDITING_GROUP_ID', payload: id });
  const setAddingSubtaskId = (id: number | null) => dispatch({ type: 'SET_ADDING_SUBTASK_ID', payload: id });
  const setDeleteTarget = (target: { type: "task" | "group"; id: number } | null) => 
    dispatch({ type: 'SET_DELETE_TARGET', payload: target });
  const toggleGroupCollapse = (groupId: number) => 
    dispatch({ type: 'TOGGLE_GROUP_COLLAPSE', payload: groupId });

  return {
    state,
    actions: {
      setTasks,
      setGroups,
      setNewTask,
      setNewGroup,
      setIsAddingGroup,
      setEditingTaskId,
      setEditingGroupId,
      setAddingSubtaskId,
      setDeleteTarget,
      toggleGroupCollapse,
    }
  };
};