import { Group } from "../taskManager/types";

export const handleGroupDragEnd = (
  groups: Group[],
  activeGroupId: number,
  overGroupId: number
): Group[] => {
  const updatedGroups = [...groups].sort((a, b) => a.order - b.order);
  const activeIndex = updatedGroups.findIndex(g => g.id === activeGroupId);
  const overIndex = updatedGroups.findIndex(g => g.id === overGroupId);

  if (activeIndex !== -1 && overIndex !== -1) {
    const [movedGroup] = updatedGroups.splice(activeIndex, 1);
    updatedGroups.splice(overIndex, 0, movedGroup);

    // 順序を正規化（0から始まる連続した数値に）
    return updatedGroups.map((group, index) => ({
      ...group,
      order: index,
    }));
  }

  return groups;
};