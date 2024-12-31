import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Group } from "@/hooks/useTaskManager";
import { DraggableGroup } from "./DraggableGroup";

interface GroupListProps {
  groups: Group[];
  tasks: Task[];
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
  onReorderSubtasks: (startIndex: number, endIndex: number, parentId: number) => void;
  toggleGroupCollapse: (groupId: number) => void;
}

export const GroupList = ({
  groups,
  tasks,
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
  onReorderSubtasks,
  toggleGroupCollapse,
}: GroupListProps) => {
  return (
    <SortableContext
      items={groups.map(group => `group-${group.id}`)}
      strategy={verticalListSortingStrategy}
    >
      {groups.map((group) => (
        <DraggableGroup
          key={group.id}
          group={group}
          tasks={tasks}
          newTask={newTask}
          editingTaskId={editingTaskId}
          editingGroupId={editingGroupId}
          addingSubtaskId={addingSubtaskId}
          isCollapsed={collapsedGroups.has(group.id)}
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
          onReorderSubtasks={onReorderSubtasks}
          toggleGroupCollapse={toggleGroupCollapse}
        />
      ))}
    </SortableContext>
  );
};