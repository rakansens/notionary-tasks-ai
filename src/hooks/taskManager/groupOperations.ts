import { Group, Task } from './types';

export const addGroupToState = (
  prevGroups: Group[],
  newGroup: Group
): Group[] => {
  return [...prevGroups, { ...newGroup, order: prevGroups.length }];
};

export const updateGroupNameInState = (
  prevGroups: Group[],
  id: number,
  name: string
): Group[] => {
  return prevGroups.map(group =>
    group.id === id ? { ...group, name } : group
  );
};

export const deleteGroupFromState = (
  prevGroups: Group[],
  id: number
): Group[] => {
  return prevGroups.filter(group => group.id !== id);
};

export const cleanupTasksAfterGroupDelete = (
  tasks: Task[],
  groupId: number
): Task[] => {
  return tasks.filter(task => task.groupId !== groupId);
};

export const updateGroupOrder = async (groups: Group[], setGroups: (groups: Group[]) => void) => {
  try {
    // Update the order of each group based on its position in the array
    const updatedGroups = groups.map((group, index) => ({
      ...group,
      order: index,
    }));
    setGroups(updatedGroups);
  } catch (error) {
    console.error('Error updating group order:', error);
    throw error;
  }
};