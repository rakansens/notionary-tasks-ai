import { cn } from "@/lib/utils";

interface SubtaskContainerProps {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
}

export const SubtaskContainer = ({
  children,
  onClick,
}: SubtaskContainerProps) => {
  return (
    <div 
      className={cn("pl-6 space-y-0.5")} 
      onClick={onClick}
    >
      {children}
    </div>
  );
};