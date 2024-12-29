import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useTaskManager } from "@/hooks/useTaskManager";
import { TaskItem } from "./TaskItem";
import { TaskInput } from "./TaskInput";
import { GroupList } from "./GroupList";

export const TaskSection = () => {
  const {
    tasks,
    groups,
    newTask,
    newGroup,
    isAddingGroup,
    editingTaskId,
    editingGroupId,
    deleteTarget,
    setNewTask,
    setNewGroup,
    setIsAddingGroup,
    setEditingTaskId,
    setEditingGroupId,
    addTask,
    addGroup,
    toggleTask,
    updateTaskTitle,
    updateGroupName,
    deleteTask,
    deleteGroup,
    confirmDelete,
    cancelDelete,
  } = useTaskManager();

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-2 border-b">
        <h2 className="text-xl font-semibold text-foreground">タスク管理</h2>
      </div>
      
      <ScrollArea className="flex-1 p-1">
        <div className="space-y-0.5">
          {tasks
            .filter(task => !task.groupId)
            .map(task => (
              <TaskItem
                key={task.id}
                task={task}
                editingTaskId={editingTaskId}
                setEditingTaskId={setEditingTaskId}
                toggleTask={toggleTask}
                updateTaskTitle={updateTaskTitle}
                deleteTask={deleteTask}
                newTask={newTask}
                setNewTask={setNewTask}
                addTask={addTask}
              />
            ))}
          
          <GroupList
            groups={groups}
            tasks={tasks}
            newTask={newTask}
            editingTaskId={editingTaskId}
            editingGroupId={editingGroupId}
            setNewTask={setNewTask}
            setEditingTaskId={setEditingTaskId}
            setEditingGroupId={setEditingGroupId}
            addTask={addTask}
            toggleTask={toggleTask}
            updateTaskTitle={updateTaskTitle}
            updateGroupName={updateGroupName}
            deleteTask={deleteTask}
            deleteGroup={deleteGroup}
          />
        </div>
      </ScrollArea>
      
      <div className="p-2 border-t space-y-2">
        {isAddingGroup ? (
          <div className="flex items-center gap-1">
            <Input
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addGroup()}
              onBlur={() => {
                if (newGroup.trim()) {
                  addGroup();
                } else {
                  setIsAddingGroup(false);
                }
              }}
              placeholder="新しいグループ名..."
              className="flex-1 h-7 py-0"
              autoFocus
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center gap-2 text-muted-foreground"
            onClick={() => setIsAddingGroup(true)}
          >
            <FolderPlus className="h-4 w-4" />
            グループを追加
          </Button>
        )}

        <TaskInput
          value={newTask}
          onChange={setNewTask}
          onSubmit={() => addTask()}
        />
      </div>

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