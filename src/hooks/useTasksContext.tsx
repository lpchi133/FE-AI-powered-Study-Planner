import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./useAxios";
import { Task, TaskStatus, FocusSession } from "../types/task";
import moment, { Moment } from "moment";

type TasksContextType = {
  tasks: Task[];
  getTaskById: (id: number) => Task | undefined;
  getTaskIds: (excludeCompleted?: boolean) => number[];
  getTaskMap: () => Record<number, Task>;
  getCompleteTaskIds: () => number[];
  setSearch: (payload: Partial<SearchState>) => void;
  resetSearch: () => void;
  updateTask: (id: number, updatedTask: Partial<Task>) => void;
  getFocusSessionsByTaskId: (taskId: number) => FocusSession[];
};

const TaskContext = createContext<TasksContextType>({
  tasks: [],
  getTaskById: () => undefined,
  getTaskIds: () => [],
  getTaskMap: () => ({}),
  getCompleteTaskIds: () => [],
  setSearch: () => {},
  resetSearch: () => {},
  updateTask: () => {},
  getFocusSessionsByTaskId: () => [],
});

export type SearchState = {
  title: string;
  fromDate: Moment | null;
  toDate: Moment | null;
};

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const { get, post } = useAxios();
  const queryClient = useQueryClient();
  const [search, _setSearch] = useState<SearchState>({
    title: "",
    fromDate: null,
    toDate: null,
  });

  const setSearch = (payload: Partial<SearchState>) => {
    _setSearch((prev) => ({
      ...prev,
      ...payload,
    }));
  };

  const resetSearch = () => {
    _setSearch({
      title: "",
      fromDate: null,
      toDate: null,
    });
  };

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await get(`/tasks`);
      const data = (response || []) as Task[];
  
      const now = new Date();
  
      // Cập nhật trạng thái của mỗi task và đồng bộ lên database
      const updatedTasks = await Promise.all(
        data.map(async (task) => {
          const dueDate = new Date(task.dueDateTime);
          let updatedStatus = task.itemStatus;
  
          if (task.itemStatus !== TaskStatus.Completed) {
            if (now > dueDate) {
              updatedStatus = TaskStatus.Overdue;
            } else if (task.itemStatus === TaskStatus.NotStarted && now < dueDate) {
              updatedStatus = TaskStatus.NotStarted;
            } else {
              updatedStatus = TaskStatus.OnGoing;
            }
          }
  
          if (updatedStatus !== task.itemStatus) {
            // Nếu trạng thái thay đổi, gửi yêu cầu API để cập nhật
            await post(`/tasks/updateTaskStatus`, { id: task.id, itemStatus: updatedStatus });
          }
  
          return { ...task, itemStatus: updatedStatus };
        })
      );
  
      return updatedTasks;
    },
  });
  

  const searchFunction = useCallback(
    (tasks: Task[]) => {
      return tasks.filter((task) => {
        if (search.title && !task.itemLabel.toLowerCase().includes(search.title.toLowerCase())) {
          return false;
        }
        if (search.fromDate && moment(task.dateTimeSet).isBefore(search.fromDate, "day")) {
          return false;
        }
        if (search.toDate && moment(task.dueDateTime).isAfter(search.toDate, "day")) {
          return false;
        }
        return true;
      });
    },
    [search]
  );

  const getAllTasks = useMemo(() => {
    return searchFunction(tasks || []);
  }, [tasks, searchFunction]);

  const getTaskById = useCallback(
    (id: number) => {
      return getAllTasks.find((task) => task.id === id);
    },
    [getAllTasks]
  );

  const getTaskIds = useCallback(
    (excludeCompleted = false) => {
      if (excludeCompleted) {
        return getAllTasks.filter((task) => task.itemStatus !== TaskStatus.Completed).map((task) => task.id) || [];
      }
      return getAllTasks.map((task) => task.id) || [];
    },
    [getAllTasks]
  );

  const getTaskMap = useCallback(() => {
    const res = getAllTasks.reduce((acc, t) => {
      return {
        ...(acc || {}),
        [t.id]: t,
      };
    }, {});
    return res as Record<number, Task>;
  }, [getAllTasks]);

  const getCompleteTaskIds = useCallback(() => {
    return tasks?.reduce((acc, t) => {
      if (t.itemStatus === TaskStatus.Completed) {
        return [...(acc || []), t.id];
      }
      return acc;
    }, [] as number[]) || [];
  }, [tasks]);

  const updateTask = useCallback(
    async (id: number, updatedTask: Partial<Task>) => {
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (oldTasks) => {
        if (!oldTasks) return [];
        return oldTasks.map((task) => (task.id === id ? { ...task, ...updatedTask } : task));
      });

      try {
        const response = await post(`/tasks/updateTaskStatus`, { id, ...updatedTask });
        const updatedData = response.data as Task;

        queryClient.setQueryData<Task[]>(["tasks"], (oldTasks) => {
          if (!oldTasks) return [];
          return oldTasks.map((task) => (task.id === id ? { ...task, ...updatedData } : task));
        });
      } catch (error) {
        console.error("Failed to update task:", error);
        queryClient.setQueryData<Task[]>(["tasks"], previousTasks);
      }
    },
    [post, queryClient]
  );

  const getFocusSessionsByTaskId = useCallback(
    (taskId: number) => {
      const task = getTaskById(taskId);
      return task ? task.focusSessions : [];
    },
    [getTaskById]
  );

  return (
    <TaskContext.Provider
      value={{
        tasks: tasks || [],
        getTaskById,
        getTaskIds,
        getTaskMap,
        getCompleteTaskIds,
        setSearch,
        resetSearch,
        updateTask,
        getFocusSessionsByTaskId,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within TaskProvider");
  }
  return context;
};
export default useTasks;