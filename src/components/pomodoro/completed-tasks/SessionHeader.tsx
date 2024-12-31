import { format } from "date-fns";

interface SessionHeaderProps {
  session: any;
}

export const SessionHeader = ({ session }: SessionHeaderProps) => {
  return (
    <div className="px-4 py-3 bg-[#F7F7F7]">
      <h3 className="text-sm font-medium text-notion-primary flex items-center justify-between">
        <span>{session.name}</span>
        <span className="text-notion-secondary text-xs">
          {format(session.startTime, "M/d HH:mm")}
          {session.endTime && ` - ${format(session.endTime, "HH:mm")}`}
        </span>
      </h3>
    </div>
  );
};