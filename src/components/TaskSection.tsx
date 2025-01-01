import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Task, Group } from "@/hooks/taskManager/types";  // Added Group import
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
import { Folder } from "lucide-react";

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