import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GroupHeader } from "./GroupHeader";
import { TaskItem } from "./TaskItem";
import { TaskInput } from "./TaskInput";
import type { Task, Group } from "@/hooks/useTaskManager";

interface GroupListProps {
  groups: Group[];
  tasks: Task[];
  newTask: string;
  editingTaskId: number | null;
  editingGroupId: number | null;
  addingSubtaskId: number | null;
  setNewTask: (value: string) => void;
  setEditingTaskId: (id: number | null) => void;
  setEditingGroupId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
  addTask: (groupId?: number) => void;
  toggleTask: (id: number) => void;
  updateTaskTitle: (id: number, title: string) => void;
  updateGroupName: (id: number, name: string) => void;
  deleteTask: (id: number) => void;
  deleteGroup: (id: number) => void;
}

export const GroupList = ({
  groups,
  tasks,
  newTask,
  editingTaskId,
  editingGroupId,
  addingSubtaskId,
  setNewTask,
  setEditingTaskId,
  setEditingGroupId,
  setAddingSubtaskId,
  addTask,
  toggleTask,
  updateTaskTitle,
  updateGroupName,
  deleteTask,
  deleteGroup,
}: GroupListProps) => {
  return (
    <div className="space-y-0.5">
      {groups.map(group => (
        <div key={group.id} className="mt-2">
          <GroupHeader
            group={group}
            editingGroupId={editingGroupId}
            setEditingGroupId={setEditingGroupId}
            updateGroupName={updateGroupName}
            deleteGroup={deleteGroup}
          />
          <div className="pl-4 space-y-0.5">
            {tasks
              .filter(task => task.groupId === group.id)
              .map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  editingTaskId={editingTaskId}
                  addingSubtaskId={addingSubtaskId}
                  setEditingTaskId={setEditingTaskId}
                  setAddingSubtaskId={setAddingSubtaskId}
                  toggleTask={toggleTask}
                  updateTaskTitle={updateTaskTitle}
                  deleteTask={deleteTask}
                  newTask={newTask}
                  setNewTask={setNewTask}
                  addTask={addTask}
                />
              ))}
            <TaskInput
              value={newTask}
              onChange={setNewTask}
              onSubmit={() => addTask(group.id)}
              groupId={group.id}
            />
          </div>
        </div>
      ))}
    </div>
  );
};