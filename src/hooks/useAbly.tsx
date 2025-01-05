import { useEffect, useRef } from "react";
import Ably from "ably";
import useTasks from "./useTasksContext";
import { TaskStatus } from "../types/task";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface TaskOverdueData {
  taskId: number;
  message: string;
}

export const useAbly = () => {
  const { updateTask } = useTasks();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const ablyClient = useRef<Ably.Realtime | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Initialize Ably client
    ablyClient.current = new Ably.Realtime({
      key: import.meta.env.VITE_ABLY_API_KEY,
    });
    const channel = ablyClient.current.channels.get(`user-${user.id}`);

    // Subscribe to task-overdue notifications
    channel.subscribe("task-overdue", (message) => {
      const data = message.data as TaskOverdueData;
      console.log(`Task ${data.taskId} is overdue! Message: ${data.message}`);

      // Update task status to "Overdue"
      updateTask(data.taskId, { itemStatus: TaskStatus.Overdue });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    });

    // Cleanup when component unmounts
    return () => {
      channel.unsubscribe();
      ablyClient.current?.close();
    };
  }, [user?.id, updateTask, queryClient]);
};
