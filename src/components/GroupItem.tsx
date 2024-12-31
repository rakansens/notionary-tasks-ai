import { Folder, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Group } from "@/hooks/useTaskManager";

interface GroupItemProps {
  group: Group;
  editingGroupId: number | null;
  setEditingGroupId: (id: number | null) => void;
  updateGroupName: (id: number, name: string) => void;
  deleteGroup: (id: number) => void;
}

export const GroupItem = ({
  group,
  editingGroupId,
  setEditingGroupId,
  updateGroupName,
  deleteGroup,
}: GroupItemProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (group.name.trim()) {
        setEditingGroupId(null);
      }
    } else if (e.key === "Escape") {
      setEditingGroupId(null);
    }
  };

  return (
    <div className="flex items-center gap-2 p-1 text-sm font-medium text-notion-secondary group">
      <Folder className="h-4 w-4" />
      {editingGroupId === group.id ? (
        <Input
          value={group.name}
          onChange={(e) => updateGroupName(group.id, e.target.value)}
          onBlur={() => {
            if (group.name.trim()) {
              setEditingGroupId(null);
            }
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 h-6 py-0 px-1 bg-transparent border-none focus:ring-0"
          autoFocus
        />
      ) : (
        <span
          className="flex-1 cursor-pointer hover:text-notion-primary transition-colors duration-200"
          onClick={() => setEditingGroupId(group.id)}
        >
          {group.name}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-notion-hover"
        onClick={() => deleteGroup(group.id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};