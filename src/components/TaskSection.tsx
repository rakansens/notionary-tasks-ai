import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useTaskManager } from "@/hooks/useTaskManager";
import { TaskItem } from "./TaskItem";
import { TaskInput } from "./TaskInput";
import { GroupList } from "./GroupList";
import { DraggableTask } from "./DraggableTask";
import { PomodoroHeader } from "./pomodoro/PomodoroHeader";
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
  const activeTask = tasks.find(task => task.id === editingTaskId);

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
      <div className="p-4 border-b border-notion-border flex items-center justify-between">
        <h2 className="text-xl font-medium text-notion-primary">タスク管理</h2>
        <PomodoroHeader />
      </div>
      
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
      
      <div className="p-4 border-t border-notion-border space-y-3">
        {isAddingGroup ? (
          <div className="flex items-center gap-2">
            <Input
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addGroup()}
              onBlur={() => {
                if (newGroup.trim()) {
                  addGroup();
                } else {
                  setIsAddingGroup(false);
                }
              }}
              placeholder="新しいグループ名..."
              className="h-8 text-sm bg-transparent border-notion-border focus:border-notion-primary focus:ring-0"
              autoFocus
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center gap-2 text-notion-secondary hover:bg-notion-hover"
            onClick={() => setIsAddingGroup(true)}
          >
            <FolderPlus className="h-4 w-4" />
            グループを追加
          </Button>
        )}

        <TaskInput
          value={newTask}
          onChange={setNewTask}
          onSubmit={() => addTask()}
        />
      </div>

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