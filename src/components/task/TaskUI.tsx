import { DeleteConfirmDialog } from "../DeleteConfirmDialog";
import { TaskHeader } from "./TaskHeader";
import { TaskFooter } from "./TaskFooter";
import { TaskMainContent } from "./TaskMainContent";
import { useTaskContext } from "@/contexts/TaskContext";
import { useDragAndDrop } from "@/hooks/dragAndDrop/useDragAndDrop";

export const TaskUI = () => {
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
    handleReorderSubtasks,
    toggleGroupCollapse,
  } = useTaskContext();

  const {
    dragAndDropState,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop(tasks, updateTaskOrder);

  return (
    <div className="flex flex-col h-full bg-white">
      <TaskHeader />
      
      <TaskMainContent
        tasks={tasks}
        groups={groups}
        newTask={newTask}
        editingTaskId={editingTaskId}
        editingGroupId={editingGroupId}
        addingSubtaskId={addingSubtaskId}
        collapsedGroups={collapsedGroups}
        dragAndDropState={dragAndDropState}
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
      
      <TaskFooter
        isAddingGroup={isAddingGroup}
        newGroup={newGroup}
        setNewGroup={setNewGroup}
        setIsAddingGroup={setIsAddingGroup}
        addGroup={() => addGroup(newGroup)}
        newTask={newTask}
        setNewTask={setNewTask}
        addTask={addTask}
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