import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useTaskManager } from "@/hooks/useTaskManager";
import { TaskItem } from "./TaskItem";
import { DraggableTask } from "./DraggableTask";
import { GroupList } from "./GroupList";
import { TaskHeader } from "./task/TaskHeader";
import { TaskFooter } from "./task/TaskFooter";
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
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

export const TaskSection = () => {
  const {
    tasks,
    groups,
    newTask,
    newGroup,
    isAddingGroup,
    editingTaskId,
    editingGroupId,
    addingSubtaskId,
    deleteTarget,
    setNewTask,
    setNewGroup,
    setIsAddingGroup,
    setEditingTaskId,
    setEditingGroupId,
    setAddingSubtaskId,
    addTask,
    addGroup,
    toggleTask,
    updateTaskTitle,
    updateGroupName,
    deleteTask,
    deleteGroup,
    confirmDelete,
    cancelDelete,
    updateTaskOrder,
  } = useTaskManager();

  const nonGroupTasks = tasks.filter(task => !task.groupId && !task.parentId);

  const {
    dragAndDropState,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop(tasks, groups, updateTaskOrder);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <TaskHeader />
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
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
                />
              ))}
            </SortableContext>
            
            <GroupList
              groups={groups}
              tasks={tasks}
              newTask={newTask}
              editingTaskId={editingTaskId}
              editingGroupId={editingGroupId}
              addingSubtaskId={addingSubtaskId}
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
            />

            <DragOverlay>
              {dragAndDropState.activeId ? (
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
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </ScrollArea>
      
      <TaskFooter
        isAddingGroup={isAddingGroup}
        newGroup={newGroup}
        setNewGroup={setNewGroup}
        setIsAddingGroup={setIsAddingGroup}
        addGroup={addGroup}
        newTask={newTask}
        setNewTask={setNewTask}
        addTask={() => addTask()}
      />

      <DeleteConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={`${deleteTarget?.type === "task" ? "タスク" : "グループ"}を削除`}
        description={`このアイテムを削除してもよろしいですか？${
          deleteTarget?.type === "group" ? "グループ内のすべてのタスクも削除されます。" : ""
        }`}
      />
    </div>
  );
};