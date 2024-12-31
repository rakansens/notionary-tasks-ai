import { FolderPlus } from "lucide-react";
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
  setNewTask: (value: string) => void;
  setEditingTaskId: (id: number | null) => void;
  setEditingGroupId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
  addTask: (groupId?: number, parentId?: number) => void;
  toggleTask: (id: number, parentId?: number) => void;
  updateTaskTitle: (id: number, title: string, parentId?: number) => void;
  updateGroupName: (id: number, name: string) => void;
  deleteTask: (id: number, parentId?: number) => void;
  deleteGroup: (id: number) => void;
  updateTaskOrder: (tasks: Task[]) => void;
  onReorderSubtasks?: (startIndex: number, endIndex: number, parentId: number) => void;
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
  updateTaskOrder,
  onReorderSubtasks,
}: GroupListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    dragAndDropState,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop(tasks, groups, updateTaskOrder);

  const activeTask = dragAndDropState.activeId
    ? tasks.find(task => task.id.toString() === dragAndDropState.activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="space-y-0.5">
        {groups.map(group => {
          const groupTasks = tasks.filter(task => task.groupId === group.id && !task.parentId);

          return (
            <div key={group.id} className="space-y-1">
              <GroupItem
                group={group}
                editingGroupId={editingGroupId}
                setEditingGroupId={setEditingGroupId}
                updateGroupName={updateGroupName}
                deleteGroup={deleteGroup}
              />
              <div className="pl-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                >
                  <SortableContext
                    items={groupTasks.map(task => task.id.toString())}
                    strategy={verticalListSortingStrategy}
                  >
                    {groupTasks.map(task => (
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
                </DndContext>
              </div>
            </div>
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? (
          <TaskItem
            task={activeTask}
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
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};