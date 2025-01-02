import { useEffect } from 'react';
import { fetchInitialData } from './supabaseOperations';
import { mapSupabaseTaskToTask, mapSupabaseGroupToGroup } from './mappers';
import { useToast } from "@/components/ui/use-toast";

export const useInitialData = (
  setTasks: (tasks: any[]) => void,
  setGroups: (groups: any[]) => void,
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
  }, [setTasks, setGroups, toast]);
};