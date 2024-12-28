import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import useAxios from "./useAxios";
import { Task, TaskStatus } from "../types/task";
import moment, { Moment } from "moment";

type TasksContextType = {
  tasks: Task[];
  getTaskById: (id: number) => Task | undefined;
  getTaskIds: (excludeCompleted?: boolean) => number[];
  getTaskMap: () => Record<number, Task>;
  getCompleteTaskIds:()=> number[];
  setSearch:(payload:Partial<SearchState>)=>void
  resetSearch: () => void;
  updateTask: (id: number, updatedTask: Partial<Task>) => void;
};

// Create AuthContext
const TaskContext = createContext<TasksContextType>({
  tasks: [],
  getTaskById: () => undefined,
  getTaskIds: () => [],
  getTaskMap: () => ({}),
  getCompleteTaskIds:()=>[],
  setSearch:()=>{},
  resetSearch:()=>{},
  updateTask: () => {},
});

export type SearchState={
  title:string,
  fromDate:Moment | null,
  toDate:Moment | null,
}

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const { get, post } = useAxios();
  const queryClient = useQueryClient();
  const [search,_setSearch] =useState<SearchState>({
    title:"",
    fromDate:null,
    toDate:null
  }

  )
  const setSearch=(payload:Partial<SearchState>)=>{
      _setSearch((prev)=>({
        ...prev,
        ...payload
      }))

  }

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
      return data;
    },
  });

  const searchFunction = useCallback((tasks: Task[]) => {
    return tasks.filter((task) => {
      // Kiểm tra title nếu có
      if (search.title && !task.itemLabel.toLowerCase().includes(search.title.toLowerCase())) {
        return false; // Nếu title không khớp, loại bỏ task này
      }
  
      // Kiểm tra từ ngày (fromDate) nếu có
      if (search.fromDate && moment(task.dateTimeSet).isBefore(search.fromDate, "day")) {
        return false; // Nếu ngày của task trước fromDate, loại bỏ task này
      }
  
      // Kiểm tra đến ngày (toDate) nếu có
      if (search.toDate && moment(task.dueDateTime).isAfter(search.toDate, "day")) {
        return false; // Nếu ngày của task sau toDate, loại bỏ task này
      }
  
      // Nếu không có điều kiện nào trên, task này sẽ được giữ lại
      return true;
    });
  }, [search]);
  

  const getAllTasks= useMemo(()=>{
    console.log(tasks)
    return searchFunction(tasks||[]);
  },[tasks,searchFunction])


  const getTaskById = useCallback(
    (id: number) => {
      return getAllTasks.find((task) => task.id === id);
    },
    [getAllTasks]
  );

  const getTaskIds = useCallback((excludeCompleted = false) => {
    if (excludeCompleted) {
      return getAllTasks
        .filter(task => task.itemStatus !== TaskStatus.Completed)
        .map(task => task.id) || [];
    }
    return getAllTasks.map(task => task.id) || [];
  }, [getAllTasks]);

  const getTaskMap = useCallback(() => {
    const res = getAllTasks.reduce((acc, t) => {
      return {
        ...(acc || {}),
        [t.id]: t,
      };
    }, {});
    return res as Record<number, Task>;
  }, [getAllTasks]);

  const getCompleteTaskIds= useCallback(()=>{
    return tasks?.reduce((acc,t)=>{
      if(t.itemStatus===TaskStatus.Completed){
        return [...(acc||[]),t.id];
      }
      return acc
    },[] as number[]) || []
  },[tasks])

  const updateTask = useCallback(
    async (id: number, updatedTask: Partial<Task>) => {
      // Lưu lại trạng thái cũ
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);
  
      // Optimistic Update: Cập nhật giao diện ngay lập tức
      queryClient.setQueryData<Task[]>(["tasks"], (oldTasks) => {
        if (!oldTasks) return [];
        return oldTasks.map((task) =>
          task.id === id ? { ...task, ...updatedTask } : task
        );
      });
  
      try {
        const response = await post(`/tasks/updateTaskStatus`, { id, ...updatedTask });
        const updatedData = response.data as Task;
        console.log("response:", response.data);
  
        // Cập nhật cache với dữ liệu chính thức từ server
        queryClient.setQueryData<Task[]>(["tasks"], (oldTasks) => {
          if (!oldTasks) return [];
          return oldTasks.map((task) =>
            task.id === id ? { ...task, ...updatedData } : task
          );
        });
      } catch (error) {
        console.error("Failed to update task:", error);
  
        // Rollback: Khôi phục trạng thái cũ nếu thất bại
        queryClient.setQueryData<Task[]>(["tasks"], previousTasks);
      }
    },
    [post, queryClient]
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
