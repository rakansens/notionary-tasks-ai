import { Task, Group } from "@/types/models";
import type { UpdateTaskOrderFn, UpdateGroupOrderFn } from "./types";

export const handleGroupDragEnd = (
  activeId: string,
  overId: string,
  groups: Group[],
  tasks: Task[],
  updateTaskOrder: UpdateTaskOrderFn,
  updateGroupOrder: UpdateGroupOrderFn
) => {
  const activeGroupId = Number(activeId.replace('group-', ''));
  const overGroupId = Number(overId.replace('group-', ''));

  const activeGroup = groups.find(g => g.id === activeGroupId);
  const overGroup = groups.find(g => g.id === overGroupId);

  if (!activeGroup || !overGroup) return;

  // グループの順序を更新
  const updatedGroups = [...groups].sort((a, b) => a.order - b.order);
  const activeIndex = updatedGroups.findIndex(g => g.id === activeGroupId);
  const overIndex = updatedGroups.findIndex(g => g.id === overGroupId);

  if (activeIndex !== -1 && overIndex !== -1) {
    // グループの位置を更新
    const [movedGroup] = updatedGroups.splice(activeIndex, 1);
    updatedGroups.splice(overIndex, 0, movedGroup);

    // グループの順序を更新
    const reorderedGroups = updatedGroups.map((group, index) => ({
      ...group,
      order: index,
    }));

    // グループ内のタスクの順序も維持
    const updatedTasks = tasks.map(task => {
      if (task.groupId === activeGroupId) {
        return {
          ...task,
          groupId: activeGroupId,
        };
      }
      return task;
    });

    updateTaskOrder(updatedTasks);
    updateGroupOrder(reorderedGroups);
  }
};
