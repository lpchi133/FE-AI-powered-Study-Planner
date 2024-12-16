import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop, { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { useQuery, useMutation, useQueryClient, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import useAxios from "../../hooks/useAxios";
import { useAuth } from "../../hooks/useAuth";

const DragAndDropCalendar = withDragAndDrop<Task>(Calendar);

interface Task {
  id: number;
  itemLabel: string;
  itemDescription: string;
  itemPriority: string;
  itemStatus: string;
  dateTimeSet?: Date;
  dueDateTime?: Date;
}

const priorityColors: Record<string, string> = {
  High: "#ef4444",
  Medium: "#eab308",
  Low: "#22c55e",
};

const DnDCalendar: React.FC = () => {
  const { user } = useAuth();
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const [calendarEvents, setCalendarEvents] = useState<Task[]>([]);

  // Fetch tasks
  const { isLoading, error } = useQuery<Task[]>({
    queryKey: ["tasks", user?.id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/tasks`); // link to apiapi
      return response.data as Task[];
    },
    onSuccess: (data: Task[]) => {
      const events = data.map((task) => ({
        ...task,
        start: task.dueDateTime ? new Date(task.dueDateTime) : undefined,
        end: task.dueDateTime ? new Date(task.dueDateTime) : undefined,
      }));
      setCalendarEvents(events);
    },
  } as UseQueryOptions<Task[], Error, Task[], QueryKey>);

  // Mutation to update a task
  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Task) => {
      const response = await axiosInstance.post(`/updateTimeTask`, {
        id: updatedTask.id,
        start_date: updatedTask.dateTimeSet?.toISOString(),
        date: updatedTask.dueDateTime?.toISOString(),
      });
      return response.data;
    },
    onSuccess: (updatedTask) => {
      // Optimistically update the calendar events
      setCalendarEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === updatedTask.id ? updatedTask : event))
      );

      // Optionally refetch tasks to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] });
    },
  });

  const handleEventDrop = (args: EventInteractionArgs<Task>) => {
      // Get time from original task
    const startHour = args.event.dateTimeSet?.getHours() || 0;
    const startMinute = args.event.dateTimeSet?.getMinutes() || 0;
    const endHour = args.event.dueDateTime?.getHours() || 0;
    const endMinute = args.event.dueDateTime?.getMinutes() || 0;

    const updatedTask = {
        ...args.event,
        dateTimeSet: new Date(new Date(args.start).setHours(startHour, startMinute)),
        dueDateTime: new Date(new Date(args.end).setHours(endHour, endMinute)),
      };
    
    // Update state optimistically
    setCalendarEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === updatedTask.id ? updatedTask : event))
    );

    // Send update to the server
    updateTaskMutation.mutate(updatedTask);
  };

  const handleEventResize = (args: EventInteractionArgs<Task>) => {
    // Get time from original task
    const startHour = args.event.dateTimeSet?.getHours() || 0;
    const startMinute = args.event.dateTimeSet?.getMinutes() || 0;
    const endHour = args.event.dueDateTime?.getHours() || 0;
    const endMinute = args.event.dueDateTime?.getMinutes() || 0;

    const updatedTask = {
      ...args.event,
      dateTimeSet: new Date(new Date(args.start).setHours(startHour, startMinute)),
      dueDateTime: new Date(new Date(args.end).setHours(endHour, endMinute)),
    };

    // Update state optimistically
    setCalendarEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === updatedTask.id ? updatedTask : event))
    );

    // Send update to the server
    updateTaskMutation.mutate(updatedTask);
  };

  const localizer = momentLocalizer(moment);

  const eventStyleGetter = (event: Task) => {
    const priorityColor = priorityColors[event.itemPriority] || "#d1d5db";
    return {
      style: {
        backgroundColor: priorityColor,
        color: "white",
        padding: "0px 5px",
        border: "none",
        fontSize: "0.75rem",
      },
    };
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks.</div>;

  return (
    <div className="p-20 px-24 bg-blue-100 min-h-screen">
      <DndProvider backend={HTML5Backend}>
        <div className="bg-white shadow p-6" style={{ borderRadius: "20px" }}>
          <DragAndDropCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor={(event) => event.dateTimeSet || new Date()}
            endAccessor={(event) => event.dueDateTime || new Date()}
            style={{ height: 400 }}
            onEventDrop={handleEventDrop}
            resizable
            onEventResize={handleEventResize}
            eventPropGetter={eventStyleGetter}
          />
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-600">Legend:</h3>
            <ul className="flex gap-4 mt-2 text-sm">
              <li className="flex items-center">
                <span className="inline-block w-4 h-4 bg-red-500 mr-2"></span> High Priority
              </li>
              <li className="flex items-center">
                <span className="inline-block w-4 h-4 bg-yellow-500 mr-2"></span> Medium Priority
              </li>
              <li className="flex items-center">
                <span className="inline-block w-4 h-4 bg-green-500 mr-2"></span> Low Priority
              </li>
            </ul>
          </div>
        </div>
      </DndProvider>
    </div>
  );
};

export default DnDCalendar;