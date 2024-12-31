import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Task } from "@/hooks/taskManager/types";
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
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
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
    toggleGroupCollapse,
  } = useTaskManager();

  const nonGroupTasks = tasks.filter(task => !task.groupId && !task.parentId);

  const {
    dragAndDropState,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop(tasks, groups, (taskId: number, newGroupId?: number, newIndex?: number) => {
    const updatedTasks = [...tasks];
    const taskToMove = updatedTasks.find(t => t.id === taskId);
    if (!taskToMove) return;

    // Remove the task from its current position
    const filteredTasks = updatedTasks.filter(t => t.id !== taskId);

    // Find the correct insertion index
    let insertIndex: number;
    if (typeof newIndex === 'number') {
      const targetTasks = filteredTasks.filter(t => t.groupId === newGroupId && !t.parentId);
      insertIndex = targetTasks.findIndex((_, index) => index === newIndex);
      if (insertIndex === -1) insertIndex = targetTasks.length;
    } else {
      insertIndex = filteredTasks.length;
    }

    // Update the task's group
    taskToMove.groupId = newGroupId;

    // Insert the task at the new position
    filteredTasks.splice(insertIndex, 0, taskToMove);

    // Update all tasks
    updateTaskOrder(filteredTasks);
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleReorderSubtasks = (startIndex: number, endIndex: number, parentId: number) => {
    console.log(`Reordering subtasks for parentId: ${parentId}, from ${startIndex} to ${endIndex}`);
    
    // Find the task hierarchy (parent chain) for the target task
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

    // Update tasks recursively
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
            modifiers={[restrictToVerticalAxis]}
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
                  onReorderSubtasks={handleReorderSubtasks}
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

            <DragOverlay dropAnimation={{
              duration: 150,
              easing: "cubic-bezier(0.25, 1, 0.5, 1)",
            }}>
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