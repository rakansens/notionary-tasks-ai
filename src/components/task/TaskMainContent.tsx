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
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useTaskDragAndDrop } from "@/hooks/useTaskDragAndDrop";
import { TaskDragOverlay } from "./TaskDragOverlay";
import { useState } from "react";

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
  const {
    dragAndDropState,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useTaskDragAndDrop(tasks, groups, updateTaskOrder, updateGroupOrder);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8ピクセル以上動かさないとドラッグ開始しない
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const nonGroupTasks = tasks
    .filter(task => !task.groupId && !task.parentId)
    .sort((a, b) => a.order - b.order);

  console.log('DragAndDrop State:', dragAndDropState); // デバッグ用

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => {
            console.log('Drag Start:', event); // デバッグ用
            handleDragStart(event);
          }}
          onDragEnd={(event) => {
            console.log('Drag End:', event); // デバッグ用
            handleDragEnd(event);
          }}
          onDragCancel={() => {
            console.log('Drag Cancel'); // デバッグ用
            handleDragCancel();
          }}
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
              console.log('Reorder Subtasks:', { startIndex, endIndex, parentId }); // デバッグ用
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
                  console.log('Reorder Subtasks in DraggableTask:', { startIndex, endIndex, parentId }); // デバッグ用
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
              <TaskDragOverlay
                activeId={dragAndDropState.activeId}
                tasks={tasks}
                groups={groups}
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
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </ScrollArea>
  );
};
