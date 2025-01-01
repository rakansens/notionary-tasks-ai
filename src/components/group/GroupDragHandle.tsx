import { GripVertical } from "lucide-react";

interface GroupDragHandleProps {
  dragHandleProps?: Record<string, any>;
  dragAttributes?: Record<string, any>;
}

export const GroupDragHandle = ({
  dragHandleProps,
  dragAttributes,
}: GroupDragHandleProps) => {
  if (!dragHandleProps || !dragAttributes) return null;

  return (
    <div
      {...dragHandleProps}
      {...dragAttributes}
      className="touch-none cursor-grab p-2 hover:bg-notion-hover rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    >
      <GripVertical className="h-4 w-4 text-notion-secondary" />
    </div>
  );
};