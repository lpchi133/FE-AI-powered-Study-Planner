import { useQuery } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import useAxios from "./useAxios";
import { Task, TaskStatus } from "../types/task";
import moment, { Moment } from "moment";

type TasksContextType = {
  tasks: Task[];
  getTaskById: (id: number) => Task | undefined;
  getTaskIds: () => number[];
  getTaskMap: () => Record<number, Task>;
  getCompleteTaskIds:()=> number[];
  setSearch:(payload:Partial<SearchState>)=>void

};

// Create AuthContext
const TaskContext = createContext<TasksContextType>({
  tasks: [],
  getTaskById: () => undefined,
  getTaskIds: () => [],
  getTaskMap: () => ({}),
  getCompleteTaskIds:()=>[],
  setSearch:()=>{}
});

export type SearchState={
  title:string,
  fromDate:Moment | null,
  toDate:Moment | null,
}

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const { get } = useAxios();
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

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await get(`/tasks`);
      const data = (response || []) as Task[];
      return data;
    },
  });

  const searchFunction = useCallback((issues:Task[])=>{
      return issues.reduce((acc,t)=>{
        if( search.fromDate && moment(t.dateTimeSet).isBefore(search.fromDate) ){
            return acc;
        }
        if(search.toDate && moment(t.dueDateTime).isAfter(search.toDate)){
          return acc;
        }
        if(search.title && !search.title.localeCompare(t.itemLabel)){
          return acc;
        }

          return [...(acc||[]),t]

      },[] as Task[])
  },[search])

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

  const getTaskIds = useCallback(() => {
    return getAllTasks.map((task) => task.id) || [];
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

  return (
    <TaskContext.Provider value={{ tasks: tasks || [], getTaskById, getTaskIds, getTaskMap,getCompleteTaskIds,setSearch }}>
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
