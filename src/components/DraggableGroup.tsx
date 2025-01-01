import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FolderPlus, Folder, FolderOpen, Trash2, Plus, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DraggableTask } from "./DraggableTask";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, Group } from "@/hooks/useTaskManager";

interface DraggableGroupProps {
  group: Group;
  tasks: Task[];
  newTask: string;
  editingTaskId: number | null;
  editingGroupId: number | null;
  addingSubtaskId: number | null;
  isCollapsed: boolean;
  setNewTask: (value: string) => void;
  setEditingTaskId: (id: number | null) => void;
  setEditingGroupId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
  addTask: (groupId?: number) => void;
  toggleTask: (taskId: number) => void;
  updateTaskTitle: (taskId: number, title: string) => void;
  updateGroupName: (groupId: number, name: string) => void;
  deleteTask: (taskId: number) => void;
  deleteGroup: (groupId: number) => void;
  updateTaskOrder: (tasks: Task[]) => void;
  onReorderSubtasks: (startIndex: number, endIndex: number, parentId: number) => void;
  toggleGroupCollapse: (groupId: number) => void;
}

export const DraggableGroup = ({
  group,
  tasks,
  newTask,
  editingTaskId,
  editingGroupId,
  addingSubtaskId,
  isCollapsed,
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
  updateTaskOrder,
  onReorderSubtasks,
  toggleGroupCollapse,
}: DraggableGroupProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: `group-${group.id}`,
    data: {
      type: "group",
      group,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-50 rounded-lg p-4 ${isDragging ? "opacity-50" : ""} ${isOver ? "bg-gray-100" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
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
              value={group.name}
              onChange={e => updateGroupName(group.id, e.target.value)}
              onBlur={() => setEditingGroupId(null)}
              onKeyDown={e => {
                if (e.key === "Enter") {
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
      {!isCollapsed && (
        <div className="space-y-1">
          <SortableContext
            items={tasks
              .filter(task => task.groupId === group.id && !task.parentId)
              .sort((a, b) => a.order - b.order)
              .map(task => task.id.toString())}
            strategy={verticalListSortingStrategy}
          >
            {tasks
              .filter(task => task.groupId === group.id && !task.parentId)
              .sort((a, b) => a.order - b.order)
              .map(task => (
                <DraggableTask
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
                  onReorderSubtasks={onReorderSubtasks}
                />
              ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
};