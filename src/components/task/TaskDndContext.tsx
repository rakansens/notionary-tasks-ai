import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Task, Group } from "@/hooks/taskManager/types";
import { GroupList } from "../GroupList";
import { DraggableTask } from "../DraggableTask";
import { TaskDragOverlay } from "./TaskDragOverlay";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface TaskDndContextProps {
  tasks: Task[];
  groups: Group[];
  nonGroupTasks: Task[];
  dragAndDropState: any;
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
  handleReorderSubtasks: (startIndex: number, endIndex: number, parentId: number) => void;
  toggleGroupCollapse: (groupId: number) => void;
  handleDragStart: (event: any) => void;
  handleDragEnd: (event: any) => void;
  handleDragCancel: () => void;
}

export const TaskDndContext = ({
  tasks,
  groups,
  nonGroupTasks,
  dragAndDropState,
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
  handleReorderSubtasks,
  toggleGroupCollapse,
  handleDragStart,
  handleDragEnd,
  handleDragCancel,
}: TaskDndContextProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
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

      <TaskDragOverlay
        dragAndDropState={dragAndDropState}
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
    </DndContext>
  );
};