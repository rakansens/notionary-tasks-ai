import { TaskCheckbox } from "./task/TaskCheckbox";
import { TaskTitle } from "./task/TaskTitle";
import { TaskItemActions } from "./task/TaskItemActions";
import { TaskInput } from "./TaskInput";
import { SubtaskList } from "./SubtaskList";
import type { Task } from "@/hooks/useTaskManager";

interface TaskItemProps {
  task: Task;
  editingTaskId: number | null;
  addingSubtaskId: number | null;
  setEditingTaskId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
  toggleTask: (id: number, parentId?: number) => void;
  updateTaskTitle: (id: number, title: string, parentId?: number) => void;
  deleteTask: (id: number, parentId?: number) => void;
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: (groupId?: number, parentId?: number) => void;
  parentTask?: Task;
  groupName?: string;
}

export const TaskItem = ({
  task,
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
  parentTask,
  groupName,
}: TaskItemProps) => {
  const handleAddSubtask = () => {
    setAddingSubtaskId(task.id);
    setNewTask('');
  };

  const handleSubmitSubtask = () => {
    if (newTask.trim()) {
      addTask(task.groupId, task.id);
      setAddingSubtaskId(null);
      setNewTask('');
    }
  };

  const handleToggleTask = () => {
    console.log('Task before toggle:', {
      id: task.id,
      title: task.title,
      addedAt: task.addedAt,
      completed: task.completed
    });

    toggleTask(task.id, task.parentId);

    if (!task.completed) {
      const completedTask = {
        id: task.id,
        title: task.title,
        completedAt: new Date(),
        addedAt: task.addedAt,
        parentTaskTitle: parentTask?.title || null,
        grandParentTaskTitle: parentTask?.parentId ? 
          task.parentId ? parentTask?.title : null : 
          null,
        groupName: groupName || null,
      };
      
      window.dispatchEvent(new CustomEvent('taskCompleted', { 
        detail: completedTask,
        bubbles: true,
        composed: true
      }));
    }
  };

  const handleTitleChange = (title: string) => {
    console.log('Updating task title:', {
      taskId: task.id,
      newTitle: title,
      parentId: task.parentId || (task.groupId ? task.id : undefined),
      groupId: task.groupId
    });
    
    // If the task is in a group, use its own ID as the parentId
    const effectiveParentId = task.parentId || (task.groupId ? task.id : undefined);
    updateTaskTitle(task.id, title, effectiveParentId);
  };

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2 py-1 px-2 -mx-2 rounded transition-all duration-200 hover:bg-notion-hover group">
        <TaskCheckbox 
          completed={task.completed}
          onClick={handleToggleTask}
        />
        
        <TaskTitle
          title={task.title}
          completed={task.completed}
          isEditing={editingTaskId === task.id}
          onTitleChange={handleTitleChange}
          onTitleClick={() => setEditingTaskId(task.id)}
          onBlur={() => setEditingTaskId(null)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              setEditingTaskId(null);
            }
          }}
        />

        <TaskItemActions
          onAddSubtask={handleAddSubtask}
          onDelete={() => deleteTask(task.id, task.parentId)}
          onDropdownDelete={() => deleteTask(task.id, task.parentId)}
        />
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <SubtaskList
          parentTask={task}
          subtasks={task.subtasks}
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
      )}

      {addingSubtaskId === task.id && (
        <div className="pl-6">
          <TaskInput
            value={newTask}
            onChange={setNewTask}
            onSubmit={handleSubmitSubtask}
            onCancel={() => {
              setAddingSubtaskId(null);
              setNewTask('');
            }}
            parentTaskTitle={task.title}
            autoFocus
          />
        </div>
      )}
    </div>
  );
};