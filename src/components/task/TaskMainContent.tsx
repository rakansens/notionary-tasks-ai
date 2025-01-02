import { ScrollArea } from "@/components/ui/scroll-area";
import { DraggableTask } from "../DraggableTask";
import { GroupList } from "../GroupList";
import { Task, Group } from "@/hooks/useTaskManager";
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
import { TaskItem } from "../TaskItem";
import { Folder } from "lucide-react";

interface TaskMainContentProps {
  tasks: Task[];
  groups: Group[];
  newTask: string;
  editingTaskId: number | null;
  editingGroupId: number | null;
  addingSubtaskId: number | null;
  collapsedGroups: Set<number>;
  dragAndDropState: { activeId: string | null };
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
  handleReorderSubtasks: (startIndex: number, endIndex: number, parentId: number) => void;
  toggleGroupCollapse: (groupId: number) => void;
  handleDragStart: (event: any) => void;
  handleDragEnd: (event: any) => void;
  handleDragCancel: () => void;
}

export const TaskMainContent = ({
  tasks,
  groups,
  newTask,
  editingTaskId,
  editingGroupId,
  addingSubtaskId,
  collapsedGroups,
  dragAndDropState,
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
  handleReorderSubtasks,
  toggleGroupCollapse,
  handleDragStart,
  handleDragEnd,
  handleDragCancel,
}: TaskMainContentProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const nonGroupTasks = tasks
    .filter(task => !task.groupId && !task.parentId)
    .sort((a, b) => a.order - b.order);

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
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
            onReorderSubtasks={handleReorderSubtasks}
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
                onReorderSubtasks={handleReorderSubtasks}
              />
            ))}
          </SortableContext>
          
          <DragOverlay dropAnimation={{
            duration: 150,
            easing: "cubic-bezier(0.25, 1, 0.5, 1)",
          }}>
            {dragAndDropState.activeId ? (
              dragAndDropState.activeId.startsWith('group-') ? (
                <div className="shadow-lg rounded-md bg-gray-50 p-4">
                  {(() => {
                    const groupId = Number(dragAndDropState.activeId.replace('group-', ''));
                    const group = groups.find(g => g.id === groupId);
                    return group ? (
                      <div className="flex items-center gap-2">
                        <Folder className="h-5 w-5 text-gray-500" />
                        <h3 className="font-medium text-gray-900">{group.name}</h3>
                      </div>
                    ) : null;
                  })()}
                </div>
              ) : (
                <div className="shadow-lg rounded-md bg-white">
                  <TaskItem
                    task={tasks.find(t => t.id.toString() === dragAndDropState.activeId) || tasks[0]}
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
                </div>
              )
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </ScrollArea>
  );
};