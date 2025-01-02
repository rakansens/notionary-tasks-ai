import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DraggableTask } from "../DraggableTask";
import { GroupList } from "../GroupList";
import { Task, Group } from "@/hooks/taskManager/types";
import {
  DragOverlay,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { TaskItem } from "../TaskItem";
import { Folder } from "lucide-react";

interface TaskMainContentProps {
  tasks: Task[];
  groups: Group[];
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
  updateGroupOrder: (groups: Group[]) => void;
  toggleGroupCollapse: (groupId: number) => void;
}

export const TaskMainContent = ({
  tasks,
  groups,
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
  updateGroupOrder,
  toggleGroupCollapse,
}: TaskMainContentProps) => {
  const [dragAndDropState, setDragAndDropState] = useState<{ activeId: string | null }>({ activeId: null });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setDragAndDropState({ activeId: String(event.active.id) });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setDragAndDropState({ activeId: null });
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    if (activeId === overId) {
      setDragAndDropState({ activeId: null });
      return;
    }

    if (activeId.startsWith('group-') && overId.startsWith('group-')) {
      const startIndex = groups.findIndex(g => g.id === Number(activeId.replace('group-', '')));
      const endIndex = groups.findIndex(g => g.id === Number(overId.replace('group-', '')));
      
      if (startIndex !== -1 && endIndex !== -1) {
        const reorderedGroups = [...groups];
        const [movedGroup] = reorderedGroups.splice(startIndex, 1);
        reorderedGroups.splice(endIndex, 0, movedGroup);
        
        updateGroupOrder(reorderedGroups);
      }
    } else {
      const startIndex = tasks.findIndex(t => t.id === Number(activeId));
      const endIndex = tasks.findIndex(t => t.id === Number(overId));
      
      if (startIndex !== -1 && endIndex !== -1) {
        const reorderedTasks = [...tasks];
        const [movedTask] = reorderedTasks.splice(startIndex, 1);
        reorderedTasks.splice(endIndex, 0, movedTask);
        
        updateTaskOrder(reorderedTasks);
      }
    }

    setDragAndDropState({ activeId: null });
  };

  const handleDragCancel = () => {
    setDragAndDropState({ activeId: null });
  };

  const nonGroupTasks = tasks
    .filter(task => !task.groupId && !task.parentId)
    .sort((a, b) => a.order - b.order);

  return (
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
            onReorderSubtasks={(startIndex, endIndex, parentId) => {
              const parent = tasks.find(t => t.id === parentId);
              if (!parent || !parent.subtasks) return;
              
              const updatedSubtasks = [...parent.subtasks];
              const [movedTask] = updatedSubtasks.splice(startIndex, 1);
              updatedSubtasks.splice(endIndex, 0, movedTask);
              
              const updatedTasks = tasks.map(task => {
                if (task.id === parentId) {
                  return {
                    ...task,
                    subtasks: updatedSubtasks.map((subtask, index) => ({
                      ...subtask,
                      order: index,
                    })),
                  };
                }
                return task;
              });
              
              updateTaskOrder(updatedTasks);
            }}
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
                onReorderSubtasks={(startIndex, endIndex, parentId) => {
                  const parent = tasks.find(t => t.id === parentId);
                  if (!parent || !parent.subtasks) return;
                  
                  const updatedSubtasks = [...parent.subtasks];
                  const [movedTask] = updatedSubtasks.splice(startIndex, 1);
                  updatedSubtasks.splice(endIndex, 0, movedTask);
                  
                  const updatedTasks = tasks.map(task => {
                    if (task.id === parentId) {
                      return {
                        ...task,
                        subtasks: updatedSubtasks.map((subtask, index) => ({
                          ...subtask,
                          order: index,
                        })),
                      };
                    }
                    return task;
                  });
                  
                  updateTaskOrder(updatedTasks);
                }}
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
  );
};