import { DragOverlay } from "@dnd-kit/core";
import { Folder } from "lucide-react";
import { TaskItem } from "../TaskItem";
import { Task, Group } from "@/hooks/taskManager/types";

interface TaskDragOverlayProps {
  dragAndDropState: any;
  tasks: Task[];
  groups: Group[];
  editingTaskId: number | null;
  addingSubtaskId: number | null;
  setEditingTaskId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
  toggleTask: (taskId: number) => void;
  updateTaskTitle: (taskId: number, title: string) => void;
  deleteTask: (taskId: number) => void;
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: (groupId?: number) => void;
}

export const TaskDragOverlay = ({
  dragAndDropState,
  tasks,
  groups,
  editingTaskId,
  addingSubtaskId,
  setEditingTaskId,
  setAddingSubtaskId,
  toggleTask,
  updateTaskTitle,
  deleteTask,
  newTask,
  setNewTask,
  addTask,
}: TaskDragOverlayProps) => {
  return (
    <DragOverlay
      dropAnimation={{
        duration: 150,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
      }}
    >
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
  );
};