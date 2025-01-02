import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, Group } from "@/hooks/useTaskManager";
import { GroupHeader } from "./group/GroupHeader";
import { GroupContent } from "./group/GroupContent";
import { GroupContainer } from "./group/GroupContainer";
import { GroupDragHandle } from "./group/GroupDragHandle";

interface DraggableGroupProps {
  group: Group;
  tasks: Task[];
  newTask: string;
  editingTaskId: number | null;
  editingGroupId: number | null;
  addingSubtaskId: number | null;
  isCollapsed: boolean;
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

export const DraggableGroup = ({
  group,
  tasks,
  newTask,
  editingTaskId,
  editingGroupId,
  addingSubtaskId,
  isCollapsed,
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
  onReorderSubtasks,
  toggleGroupCollapse,
}: DraggableGroupProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `group-${group.id}`,
    data: {
      type: "group",
      group,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <GroupContainer
      isDragging={isDragging}
      style={style}
      setNodeRef={setNodeRef}
    >
      <GroupHeader
        group={group}
        isCollapsed={isCollapsed}
        editingGroupId={editingGroupId}
        dragHandleProps={listeners}
        dragAttributes={attributes}
        setEditingGroupId={setEditingGroupId}
        updateGroupName={updateGroupName}
        toggleGroupCollapse={toggleGroupCollapse}
        deleteGroup={deleteGroup}
        addTask={addTask}
        setNewTask={setNewTask}
      />
      
      {!isCollapsed && (
        <GroupContent
          groupId={group.id}
          tasks={tasks}
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
          onReorderSubtasks={onReorderSubtasks}
        />
      )}
    </GroupContainer>
  );
};