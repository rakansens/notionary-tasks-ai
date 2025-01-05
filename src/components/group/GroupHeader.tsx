import { GripVertical, Folder, FolderOpen, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Group } from "@/types/models";
import { useState, useEffect } from "react";

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
  const [editingName, setEditingName] = useState(group.name);

  useEffect(() => {
    setEditingName(group.name);
  }, [group.name]);

  const handleEditComplete = () => {
    if (editingName.trim()) {
      updateGroupName(group.id, editingName.trim());
      setEditingGroupId(null);
    }
  };

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
        {editingGroupId === group.id ? (
          <Input
            value={editingName}
            onChange={e => setEditingName(e.target.value)}
            onBlur={handleEditComplete}
            onKeyDown={e => {
              if (e.key === "Enter") {
                handleEditComplete();
              } else if (e.key === "Escape") {
                setEditingName(group.name);
                setEditingGroupId(null);
              }
            }}
            autoFocus
          />
        ) : (
          <h3
            className="font-medium text-gray-900 cursor-pointer"
            onClick={() => setEditingGroupId(group.id)}
          >
            {group.name}
          </h3>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setNewTask("");
            addTask(group.id);
          }}
          className="text-gray-400 hover:text-gray-700"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => deleteGroup(group.id)}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
