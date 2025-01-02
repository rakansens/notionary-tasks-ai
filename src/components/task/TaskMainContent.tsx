import { ScrollArea } from "@/components/ui/scroll-area";
import { DraggableTask } from "../DraggableTask";
import { GroupList } from "../GroupList";
import { Task, Group } from "@/hooks/taskManager/types";
import {
  DragOverlay,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { TaskDragOverlay } from "./TaskDragOverlay";
import { useState } from "react";
import { useTaskSort } from "@/contexts/TaskSortContext";

interface TaskMainContentProps {
  tasks: Task[];
  groups: Group[];
  newTask: string;
  editingTaskId: number | null;
  editingGroupId: number | null;
  addingSubtaskId: number | null;
  collapsedGroups: Set<number>;
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
  updateGroupOrder: (groups: Group[]) => void;
  toggleGroupCollapse: (groupId: number) => void;
}

export const TaskMainContent = ({
  tasks,
  groups,
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
  updateGroupOrder,
  toggleGroupCollapse,
}: TaskMainContentProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { reorderTasks } = useTaskSort();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const nonGroupTasks = tasks
    .filter(task => !task.groupId && !task.parentId)
    .sort((a, b) => a.order - b.order);

  const handleDragStart = (event: any) => {
    console.log('Drag Start:', event);
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: any) => {
    console.log('Drag End:', event);
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = nonGroupTasks.findIndex(task => task.id.toString() === active.id.toString());
      const newIndex = nonGroupTasks.findIndex(task => task.id.toString() === over.id.toString());
      
      console.log('Reordering tasks:', { oldIndex, newIndex });
      reorderTasks(oldIndex, newIndex);
    }

    setActiveId(null);
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <GroupList
            groups={groups}
            tasks={tasks}
            newTask={newTask}
            editingTaskId={editingTaskId}
            editingGroupId={editingGroupId}
            addingSubtaskId={addingSubtaskId}
            collapsedGroups={collapsedGroups}
            setNewTask={setNewTask}
            setEditingTaskId={setEditingTaskId}
            setEditingGroupId={setEditingGroupId}
            setAddingSubtaskId={setAddingSubtaskId}
            addTask={addTask}
            toggleTask={toggleTask}
            updateTaskTitle={updateTaskTitle}
            updateGroupName={updateGroupName}
            deleteTask={deleteTask}
            deleteGroup={deleteGroup}
            updateTaskOrder={updateTaskOrder}
            onReorderSubtasks={(startIndex, endIndex, parentId) => {
              console.log('Reorder Subtasks:', { startIndex, endIndex, parentId });
              reorderTasks(startIndex, endIndex, parentId);
            }}
            toggleGroupCollapse={toggleGroupCollapse}
          />

          <SortableContext
            items={nonGroupTasks.map(task => task.id.toString())}
            strategy={verticalListSortingStrategy}
          >
            {nonGroupTasks.map(task => (
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
                onReorderSubtasks={(startIndex, endIndex, parentId) => {
                  console.log('Reorder Subtasks in DraggableTask:', { startIndex, endIndex, parentId });
                  reorderTasks(startIndex, endIndex, parentId);
                }}
              />
            ))}
          </SortableContext>
          
          <DragOverlay dropAnimation={{
            duration: 150,
            easing: "cubic-bezier(0.25, 1, 0.5, 1)",
          }}>
            {activeId ? (
              <TaskDragOverlay
                activeId={activeId}
                tasks={tasks}
                groups={groups}
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
      </div>
    </ScrollArea>
  );
};