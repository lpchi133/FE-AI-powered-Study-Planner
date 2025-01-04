import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import useTasks from "../hooks/useTasksContext";
import { TaskStatus } from "../types/task";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

const SOCKET_URL = import.meta.env.VITE_ENDPOINT_URL; // Thay đổi URL nếu cần

export const useWebSocket = () => {
  const queryClient = useQueryClient();
  const { updateTask } = useTasks();
  const { user } = useAuth();
  const socket: Socket = io(SOCKET_URL, {
    query: { userId: user?.id },
  });

  useEffect(() => {
    socket.on("task-overdue", (data) => {
      console.log(`Task ${data.taskId} is overdue!`);
      //update task status to Overdue
      updateTask(data.taskId, { itemStatus: TaskStatus.Overdue });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    });

    // Clean up khi component unmount
    return () => {
      console.log("Disconnecting from WebSocket server");
      socket.disconnect();
    };
  }, [updateTask, queryClient, user?.id]);
};
