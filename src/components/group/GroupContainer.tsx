import { ReactNode } from "react";

interface GroupContainerProps {
  children: ReactNode;
  isDragging: boolean;
  style?: React.CSSProperties;
  setNodeRef: (element: HTMLElement | null) => void;
}

export const GroupContainer = ({
  children,
  isDragging,
  style,
  setNodeRef,
}: GroupContainerProps) => {
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-50 rounded-lg p-4 ${isDragging ? "opacity-50" : ""}`}
    >
      {children}
    </div>
  );
};