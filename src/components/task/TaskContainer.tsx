import { DeleteConfirmDialog } from "../DeleteConfirmDialog";
import { TaskHeader } from "./TaskHeader";
import { TaskFooter } from "./TaskFooter";
import { TaskMainContent } from "./TaskMainContent";
import { Task, Group } from "@/hooks/taskManager/types";

interface TaskContainerProps {
  tasks: Task[];
  groups: Group[];
  newTask: string;
  newGroup: string;
  isAddingGroup: boolean;
  editingTaskId: number | null;
  editingGroupId: number | null;
  addingSubtaskId: number | null;
  deleteTarget: { type: string; id: number } | null;
  collapsedGroups: Set<number>;
  dragAndDropState: { activeId: string | null };
  setNewTask: (value: string) => void;
  setNewGroup: (value: string) => void;
  setIsAddingGroup: (value: boolean) => void;
  setEditingTaskId: (id: number | null) => void;
  setEditingGroupId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
  addTask: (groupId?: number) => void;
  addGroup: () => void;
  toggleTask: (taskId: number) => void;
  updateTaskTitle: (taskId: number, title: string) => void;
  updateGroupName: (groupId: number, name: string) => void;
  deleteTask: (taskId: number) => void;
  deleteGroup: (groupId: number) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
  updateTaskOrder: (tasks: Task[]) => void;
  handleReorderSubtasks: (startIndex: number, endIndex: number, parentId: number) => void;
  toggleGroupCollapse: (groupId: number) => void;
  handleDragStart: (event: any) => void;
  handleDragEnd: (event: any) => void;
  handleDragCancel: () => void;
}

export const TaskContainer = ({
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
  dragAndDropState,
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
  handleDragStart,
  handleDragEnd,
  handleDragCancel,
}: TaskContainerProps) => {
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
