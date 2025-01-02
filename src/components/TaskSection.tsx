import { useTaskManager } from "@/hooks/taskManager/useTaskManager";
import { TaskContainer } from "./task/TaskContainer";
import { TaskSortProvider } from "@/contexts/TaskSortContext";

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
  } = useTaskManager();

  const handleAddGroup = () => {
    if (newGroup.trim()) {
      window.dispatchEvent(new CustomEvent('addGroup', { detail: { name: newGroup.trim() } }));
    }
  };

  return (
    <TaskSortProvider tasks={tasks} updateTaskOrder={updateTaskOrder}>
      <TaskContainer
        tasks={tasks}
        groups={groups}
        newTask={newTask}
        newGroup={newGroup}
        isAddingGroup={isAddingGroup}
        editingTaskId={editingTaskId}
        editingGroupId={editingGroupId}
        addingSubtaskId={addingSubtaskId}
        deleteTarget={deleteTarget}
        collapsedGroups={collapsedGroups}
        setNewTask={setNewTask}
        setNewGroup={setNewGroup}
        setIsAddingGroup={setIsAddingGroup}
        setEditingTaskId={setEditingTaskId}
        setEditingGroupId={setEditingGroupId}
        setAddingSubtaskId={setAddingSubtaskId}
        addTask={addTask}
        addGroup={handleAddGroup}
        toggleTask={toggleTask}
        updateTaskTitle={updateTaskTitle}
        updateGroupName={updateGroupName}
        deleteTask={deleteTask}
        deleteGroup={deleteGroup}
        confirmDelete={confirmDelete}
        cancelDelete={cancelDelete}
        updateTaskOrder={updateTaskOrder}
        updateGroupOrder={updateGroupOrder}
        toggleGroupCollapse={toggleGroupCollapse}
      />
    </TaskSortProvider>
  );
};