import { useMutation, useQueryClient } from "@tanstack/react-query";
import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop, {
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useAxios from "../../hooks/useAxios";
import useTasks from "../../hooks/useTasksContext";
import { TaskPriority } from "../../types/task";

interface Task {
  id: number;
  itemLabel: string;
  itemDescription: string;
  itemPriority: string;
  itemStatus: string;
  dateTimeSet?: Moment;
  dueDateTime?: Moment;
}

const DragAndDropCalendar = withDragAndDrop<Task>(Calendar);

const priorityColors: Record<string, string> = {
  [TaskPriority.High]: "#ef4444",
  [TaskPriority.Medium]: "#eab308",
  [TaskPriority.Low]: "#22c55e",
};

const DnDCalendar: React.FC = () => {
  const { post } = useAxios();
  const { tasks } = useTasks();
  const queryClient = useQueryClient();
  const [calendarEvents, setCalendarEvents] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    if (tasks?.length) {
      setCalendarEvents(
        tasks.map((task) => ({
          ...task,
          dateTimeSet: moment(task.dateTimeSet),
          dueDateTime: moment(task.dueDateTime),
        }))
      );
    }
  }, [tasks]);

  // Mutation to update a task
  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Task) => {
      const response = await post(`/tasks/updateTimeTask`, {
        id: updatedTask.id,
        dateTimeSet: updatedTask.dateTimeSet?.toISOString().split("T")[0],
        dueDateTime: updatedTask.dueDateTime?.toISOString().split("T")[0],
      });
      return response.data;
    },
    onSuccess: (updatedTask) => {
      if (!updatedTask) return;
      // Optimistically update the calendar events
      setCalendarEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === updatedTask?.id ? updatedTask : event
        )
      );

      // Optionally refetch tasks to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleEventDrop = (args: EventInteractionArgs<Task>) => {
    // Get time from original task
    const startHour = args.event.dateTimeSet?.hour() || 0;
    const startMinute = args.event.dateTimeSet?.minute() || 0;
    const endHour = args.event.dueDateTime?.hour() || 0;
    const endMinute = args.event.dueDateTime?.minute() || 0;

    const updatedTask = {
      ...args.event,
      dateTimeSet: moment(args.start).hour(startHour).minute(startMinute),
      dueDateTime: moment(args.end).hour(endHour).minute(endMinute),
    };

    // Update state optimistically
    setCalendarEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedTask.id ? updatedTask : event
      )
    );

    // Send update to the server
    updateTaskMutation.mutate(updatedTask);
  };

  const handleEventResize = (args: EventInteractionArgs<Task>) => {
    // Get time from original task
    // Get time from original task
    const startHour = args.event.dateTimeSet?.hour() || 0;
    const startMinute = args.event.dateTimeSet?.minute() || 0;
    const endHour = args.event.dueDateTime?.hour() || 0;
    const endMinute = args.event.dueDateTime?.minute() || 0;

    const updatedTask = {
      ...args.event,
      dateTimeSet: moment(args.start).hour(startHour).minute(startMinute),
      dueDateTime: moment(args.end).hour(endHour).minute(endMinute),
    };

    // Optimistically update the calendar events
    setCalendarEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedTask.id ? updatedTask : event
      )
    );

    // Send update to the server
    updateTaskMutation.mutate(updatedTask);
  };

  const handleSelectEvent = (task: Task) => {
    setSelectedTask(task);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedTask(null);
  };

  const localizer = momentLocalizer(moment);

  const eventStyleGetter = (event: Task) => {
    console.log("event", event);
    const priorityColor = priorityColors[event.itemPriority] || "#d1d5db";
    return {
      style: {
        backgroundColor: priorityColor,
        color: "white",
        padding: "0px 5px",
        border: "none",
        borderRadius: "5px",
      },
    };
  };

  return (
    <div className="p-20 px-24 bg-blue-300 min-h-screen">
      <DndProvider backend={HTML5Backend}>
        <div className="bg-white shadow p-6" style={{ borderRadius: "20px" }}>
          <DragAndDropCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor={(event) => event.dateTimeSet?.toDate() || new Date()}
            endAccessor={(event) => event.dueDateTime?.toDate() || new Date()}
            titleAccessor={(event) => event.itemLabel}
            style={{ height: 500 }}
            onEventDrop={handleEventDrop}
            resizable
            onEventResize={handleEventResize}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
          />
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-600">Legend:</h3>
            <ul className="flex gap-4 mt-2 text-sm">
              <li className="flex items-center">
                <span className="inline-block w-4 h-4 bg-red-500 mr-2"></span>{" "}
                High Priority
              </li>
              <li className="flex items-center">
                <span className="inline-block w-4 h-4 bg-yellow-500 mr-2"></span>{" "}
                Medium Priority
              </li>
              <li className="flex items-center">
                <span className="inline-block w-4 h-4 bg-green-500 mr-2"></span>{" "}
                Low Priority
              </li>
            </ul>
          </div>
        </div>
      </DndProvider>
      {isPopupOpen && selectedTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {selectedTask.itemLabel}
            </h2>
            <p className="text-gray-700 mb-2">
              <strong>Description:</strong> {selectedTask.itemDescription}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Priority:</strong> {selectedTask.itemPriority}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Status:</strong> {selectedTask.itemStatus}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Start Date:</strong>{" "}
              {selectedTask.dateTimeSet?.toLocaleString() || "N/A"}
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Due Date:</strong>{" "}
              {selectedTask.dueDateTime?.toLocaleString() || "N/A"}
            </p>
            <button
              onClick={handleClosePopup}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DnDCalendar;
