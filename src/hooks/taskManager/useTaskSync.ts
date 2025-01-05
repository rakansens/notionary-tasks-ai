import { useEffect } from 'react';
import { Task, Group } from "@/types/models";
import { useToast } from "@/components/ui/use-toast";
import { fetchInitialData } from './supabaseOperations';
import { mapSupabaseTaskToTask, mapSupabaseGroupToGroup } from './mappers';

export const useTaskSync = (
  setTasks: (tasks: Task[]) => void,
  setGroups: (groups: Group[]) => void
) => {
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { tasks, groups } = await fetchInitialData();
        setTasks(tasks.map(mapSupabaseTaskToTask));
        setGroups(groups.map(mapSupabaseGroupToGroup));
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          title: "エラー",
          description: "データの読み込みに失敗しました",
          variant: "destructive",
        });
      }
    };

    loadInitialData();
  }, []);

  return {
    reloadData: async () => {
      const { tasks, groups } = await fetchInitialData();
      setTasks(tasks.map(mapSupabaseTaskToTask));
      setGroups(groups.map(mapSupabaseGroupToGroup));
    }
  };
};