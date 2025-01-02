import { useTaskManager, Task } from "@/hooks/useTaskManager";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { TaskContainer } from "./task/TaskContainer";
import { useEffect } from "react";

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
  } = useTaskManager();

  useEffect(() => {
    const handleAddGroup = (event: CustomEvent) => {
      const { name } = event.detail;
      addGroup(name);
    };

    window.addEventListener('addGroup', handleAddGroup as EventListener);

    return () => {
      window.removeEventListener('addGroup', handleAddGroup as EventListener);
    };
  }, [addGroup]);

  const handleReorderSubtasks = (startIndex: number, endIndex: number, parentId: number) => {
    console.log(`Reordering subtasks for parentId: ${parentId}, from ${startIndex} to ${endIndex}`);
    
    const findTaskHierarchy = (tasks: Task[], targetId: number): Task[] => {
      const hierarchy: Task[] = [];
      
      const findParent = (currentTasks: Task[], targetId: number): boolean => {
        for (const task of currentTasks) {
          if (task.id === targetId) {
            hierarchy.unshift(task);
            return true;
          }
          if (task.subtasks && task.subtasks.length > 0) {
            if (findParent(task.subtasks, targetId)) {
              hierarchy.unshift(task);
              return true;
            }
          }
        }
        return false;
      };
      
      findParent(tasks, targetId);
      return hierarchy;
    };

    const taskHierarchy = findTaskHierarchy(tasks, parentId);
    if (taskHierarchy.length === 0) return;

    const targetTask = taskHierarchy[taskHierarchy.length - 1];
    if (!targetTask.subtasks) return;

    const reorderedSubtasks = [...targetTask.subtasks];
    const [movedTask] = reorderedSubtasks.splice(startIndex, 1);
    reorderedSubtasks.splice(endIndex, 0, movedTask);

    const updateTasksRecursively = (tasks: Task[], hierarchy: Task[], index: number, reorderedSubtasks: Task[]): Task[] => {
      return tasks.map(task => {
        if (task.id === hierarchy[index].id) {
          if (index === hierarchy.length - 1) {
            return {
              ...task,
              subtasks: reorderedSubtasks.map((subtask, idx) => ({
                ...subtask,
                order: idx,
              })),
            };
          } else {
            return {
              ...task,
              subtasks: updateTasksRecursively(task.subtasks || [], hierarchy, index + 1, reorderedSubtasks),
            };
          }
        }
        return task;
      });
    };

    const updatedTasks = updateTasksRecursively(tasks, taskHierarchy, 0, reorderedSubtasks);
    console.log('Updated tasks:', updatedTasks);
    updateTaskOrder(updatedTasks);
  };

  const {
    dragAndDropState,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop(tasks, groups, updateTaskOrder, updateGroupOrder);

  return (
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
      dragAndDropState={dragAndDropState}
      setNewTask={setNewTask}
      setNewGroup={setNewGroup}
      setIsAddingGroup={setIsAddingGroup}
      setEditingTaskId={setEditingTaskId}
      setEditingGroupId={setEditingGroupId}
      setAddingSubtaskId={setAddingSubtaskId}
      addTask={addTask}
      addGroup={addGroup}
      toggleTask={toggleTask}
      updateTaskTitle={updateTaskTitle}
      updateGroupName={updateGroupName}
      deleteTask={deleteTask}
      deleteGroup={deleteGroup}
      confirmDelete={confirmDelete}
      cancelDelete={cancelDelete}
      updateTaskOrder={updateTaskOrder}
      handleReorderSubtasks={handleReorderSubtasks}
      toggleGroupCollapse={toggleGroupCollapse}
      handleDragStart={handleDragStart}
      handleDragEnd={handleDragEnd}
      handleDragCancel={handleDragCancel}
    />
  );
};
