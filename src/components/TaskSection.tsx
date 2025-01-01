import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Task, Group } from "@/hooks/taskManager/types";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { TaskHeader } from "./task/TaskHeader";
import { TaskFooter } from "./task/TaskFooter";
import { TaskDndContext } from "./task/TaskDndContext";

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
    collapsedGroups,
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
    updateGroupOrder,
    toggleGroupCollapse,
    handleReorderSubtasks,
  } = useTaskManager();

  const nonGroupTasks = tasks
    .filter(task => !task.groupId && !task.parentId)
    .sort((a, b) => a.order - b.order);

  const {
    dragAndDropState,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop(tasks, groups, (tasks: Task[]) => {
    updateTaskOrder(tasks);
  }, (groups: Group[]) => {
    updateGroupOrder(groups);
  });

  return (
    <div className="flex flex-col h-full bg-white">
      <TaskHeader />
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          <TaskDndContext
            tasks={tasks}
            groups={groups}
            nonGroupTasks={nonGroupTasks}
            dragAndDropState={dragAndDropState}
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
            handleReorderSubtasks={handleReorderSubtasks}
            toggleGroupCollapse={toggleGroupCollapse}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            handleDragCancel={handleDragCancel}
          />
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