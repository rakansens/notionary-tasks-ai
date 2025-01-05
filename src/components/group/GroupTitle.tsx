import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface GroupTitleProps {
  id: number;
  name: string;
  isEditing: boolean;
  onEditComplete: (id: number, name: string) => void;
  onEditStart: (id: number) => void;
}

export const GroupTitle = ({
  id,
  name,
  isEditing,
  onEditComplete,
  onEditStart,
}: GroupTitleProps) => {
  const [editingName, setEditingName] = useState(name);

  useEffect(() => {
    setEditingName(name);
  }, [name]);

  const handleEditComplete = () => {
    if (editingName.trim()) {
      onEditComplete(id, editingName.trim());
    }
  };

  if (isEditing) {
    return (
      <Input
        value={editingName}
        onChange={e => setEditingName(e.target.value)}
        onBlur={handleEditComplete}
        onKeyDown={e => {
          if (e.key === "Enter") {
            handleEditComplete();
          } else if (e.key === "Escape") {
            setEditingName(name);
            onEditComplete(id, name);
          }
        }}
        autoFocus
      />
    );
  }

  return (
    <h3
      className="font-medium text-gray-900 cursor-pointer"
      onClick={() => onEditStart(id)}
    >
      {name}
    </h3>
  );
};