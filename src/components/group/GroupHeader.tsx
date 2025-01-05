import { GripVertical, Folder, FolderOpen } from "lucide-react";
import { Group } from "@/types/models";
import { GroupTitle } from "./GroupTitle";
import { GroupActions } from "./GroupActions";

interface GroupHeaderProps {
  group: Group;
  isCollapsed: boolean;
  editingGroupId: number | null;
  dragHandleProps: Record<string, any>;
  dragAttributes: Record<string, any>;
  setEditingGroupId: (id: number | null) => void;
  updateGroupName: (groupId: number, name: string) => void;
  toggleGroupCollapse: (groupId: number) => void;
  deleteGroup: (groupId: number) => void;
  addTask: (groupId?: number) => void;
  setNewTask: (value: string) => void;
}

export const GroupHeader = ({
  group,
  isCollapsed,
  editingGroupId,
  dragHandleProps,
  dragAttributes,
  setEditingGroupId,
  updateGroupName,
  toggleGroupCollapse,
  deleteGroup,
  addTask,
  setNewTask,
}: GroupHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <button
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          {...dragHandleProps}
          {...dragAttributes}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <button
          onClick={() => toggleGroupCollapse(group.id)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isCollapsed ? (
            <Folder className="h-5 w-5" />
          ) : (
            <FolderOpen className="h-5 w-5" />
          )}
        </button>
        <GroupTitle
          id={group.id}
          name={group.name}
          isEditing={editingGroupId === group.id}
          onEditComplete={updateGroupName}
          onEditStart={setEditingGroupId}
        />
      </div>
      <GroupActions
        onAddTask={() => {
          setNewTask("");
          addTask(group.id);
        }}
        onDelete={() => deleteGroup(group.id)}
      />
    </div>
  );
};