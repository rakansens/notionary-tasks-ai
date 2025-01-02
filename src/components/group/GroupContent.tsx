import { Task } from "@/hooks/useTaskManager";
import { DraggableTask } from "../DraggableTask";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskInput } from "../TaskInput";

interface GroupContentProps {
  groupId: number;
  tasks: Task[];
  editingTaskId: number | null;
  addingSubtaskId: number | null;
  setEditingTaskId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
  toggleTask: (taskId: number, parentId?: number) => void;
  updateTaskTitle: (taskId: number, title: string, parentId?: number) => void;
  deleteTask: (taskId: number, parentId?: number) => void;
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: (groupId?: number, parentId?: number) => void;
  onReorderSubtasks: (startIndex: number, endIndex: number, parentId: number) => void;
}

export const GroupContent = ({
  groupId,
  tasks,
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
  onReorderSubtasks,
}: GroupContentProps) => {
  // グループに属する最上位のタスクのみをフィルタリング
  const groupTasks = tasks.filter(task => 
    task.groupId === groupId && !task.parentId
  );
  
  console.log('Group tasks:', groupTasks);
  const sortableItems = groupTasks.map(task => task.id.toString());

  return (
    <div className="pl-8 pr-2">
      <SortableContext
        items={sortableItems}
        strategy={verticalListSortingStrategy}
      >
        {groupTasks.map((task) => (
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
            onReorderSubtasks={onReorderSubtasks}
          />
        ))}
      </SortableContext>
      <TaskInput
        value={newTask}
        onChange={setNewTask}
        onSubmit={() => addTask(groupId)}
        groupId={groupId}
        className="pl-6"
      />
    </div>
  );
};