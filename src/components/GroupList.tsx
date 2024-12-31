import { FolderPlus, Folder, FolderOpen, Trash2, Plus } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GroupHeader } from "./GroupHeader";
import { TaskItem } from "./TaskItem";
import { DraggableTask } from "./DraggableTask";
import { TaskInput } from "./TaskInput";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import type { Task, Group } from "@/hooks/useTaskManager";
import { GroupItem } from "./GroupItem";

interface GroupListProps {
  groups: Group[];
  tasks: Task[];
  newTask: string;
  editingTaskId: number | null;
  editingGroupId: number | null;
  addingSubtaskId: number | null;
  collapsedGroups: Set<number>;
  setNewTask: (value: string) => void;
  setEditingTaskId: (value: number | null) => void;
  setEditingGroupId: (value: number | null) => void;
  setAddingSubtaskId: (value: number | null) => void;
  addTask: (groupId?: number, parentId?: number) => void;
  toggleTask: (id: number, parentId?: number) => void;
  updateTaskTitle: (id: number, title: string, parentId?: number) => void;
  updateGroupName: (id: number, name: string) => void;
  deleteTask: (id: number, parentId?: number) => void;
  deleteGroup: (id: number) => void;
  updateTaskOrder: (tasks: Task[]) => void;
  onReorderSubtasks: (startIndex: number, endIndex: number, parentId: number) => void;
  toggleGroupCollapse: (groupId: number) => void;
}

export const GroupList = ({
  groups,
  tasks,
  newTask,
  editingTaskId,
  editingGroupId,
  addingSubtaskId,
  collapsedGroups,
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
}: GroupListProps) => {
  return (
    <div className="space-y-4">
      {groups.map(group => (
        <div key={group.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleGroupCollapse(group.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                {collapsedGroups.has(group.id) ? (
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
          {!collapsedGroups.has(group.id) && (
            <div className="space-y-1">
              <SortableContext
                items={tasks
                  .filter(task => task.groupId === group.id && !task.parentId)
                  .map(task => task.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                {tasks
                  .filter(task => task.groupId === group.id && !task.parentId)
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
      ))}
    </div>
  );
};