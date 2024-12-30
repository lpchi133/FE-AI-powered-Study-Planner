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
import { Task, TaskPriority } from "../../types/task";

const DragAndDropCalendar = withDragAndDrop<Task>(Calendar);

const priorityColors: Record<string, string> = {
  [TaskPriority.High]: "#ef4444",
  [TaskPriority.Medium]: "#eab308",
  [TaskPriority.Low]: "#22c55e",
};

const DnDCalendar: React.FC = () => {
  const { post, patch, deleteReq } = useAxios();
  const { tasks } = useTasks();
  const queryClient = useQueryClient();
  const [calendarEvents, setCalendarEvents] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState<number>(0);
  const [breakDuration, setBreakDuration] = useState<number>(0);
  const [focusSessionId, setFocusSessionId] = useState<number | null>(null);

  useEffect(() => {
    if (tasks?.length) {
      setCalendarEvents(
        tasks.map((task) => ({
          ...task,
          dateTimeSet: moment(task.dateTimeSet).toISOString(),
          dueDateTime: moment(task.dueDateTime).toISOString(),
          focusTime: task.focusTime || 25,
          breakTime: task.breakTime || 5,
        }))
      );
    }
  }, [tasks]);

  // Mutation to update a task
  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Task) => {
      const response = await post(`/tasks/updateTimeTask`, {
        id: updatedTask.id,
        dateTimeSet: updatedTask.dateTimeSet?.toString().split("T")[0],
        dueDateTime: updatedTask.dueDateTime?.toString().split("T")[0],
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

  const startTimerMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await post(`/focus-timer/${taskId}/start`, {
        duration: timerDuration,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setFocusSessionId(data.id);
      setIsTimerRunning(true);
    },
  });

  const endTimerMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await patch(`/focus-timer/${sessionId}/end`, {});
      return response.data;
    },
    onSuccess: (data) => {
      setIsTimerRunning(false);
      setFocusSessionId(null);
      alert("Focus session ended. " + data.timeSpent + " minutes completed.");
    },
  });

  const cancelTimerMutation = useMutation({
    mutationFn: async (timerId: number) => {
      const response = await deleteReq(`/focus-timer/cancel`, { timerId });
      return response.data;
    },
    onSuccess: () => {
      setIsTimerRunning(false);
      setFocusSessionId(null);
      alert("Timer canceled.");
    },
  });

  const handleEventDrop = (args: EventInteractionArgs<Task>) => {
    // Get time from original task
    const startHour = moment(args.event.dateTimeSet).hour() || 0;
    const startMinute = moment(args.event.dateTimeSet).minute() || 0;
    const endHour = moment(args.event.dueDateTime).hour() || 0;
    const endMinute = moment(args.event.dueDateTime).minute() || 0;

    const updatedTask = {
      ...args.event,
      dateTimeSet: moment(args.start)
        .hour(startHour)
        .minute(startMinute)
        .toISOString(),
      dueDateTime: moment(args.end)
        .hour(endHour)
        .minute(endMinute)
        .toISOString(),
    };

    // Update state optimistically
    setCalendarEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedTask.id
          ? {
              ...updatedTask,
              dateTimeSet: updatedTask.dateTimeSet.toString(),
              dueDateTime: updatedTask.dueDateTime.toString(),
            }
          : event
      )
    );

    // Send update to the server
    updateTaskMutation.mutate(updatedTask);
  };

  const handleEventResize = (args: EventInteractionArgs<Task>) => {
    // Get time from original task
    const startHour = moment(args.event.dateTimeSet).hour() || 0;
    const startMinute = moment(args.event.dateTimeSet).minute() || 0;
    const endHour = moment(args.event.dueDateTime).hour() || 0;
    const endMinute = moment(args.event.dueDateTime).minute() || 0;

    const updatedTask = {
      ...args.event,
      dateTimeSet: moment(args.start)
        .hour(startHour)
        .minute(startMinute)
        .toISOString(),
      dueDateTime: moment(args.end)
        .hour(endHour)
        .minute(endMinute)
        .toISOString(),
    };

    // Optimistically update the calendar events
    setCalendarEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedTask.id
          ? {
              ...updatedTask,
              dateTimeSet: updatedTask.dateTimeSet.toString(),
              dueDateTime: updatedTask.dueDateTime.toString(),
            }
          : event
      )
    );

    // Send update to the server
    updateTaskMutation.mutate(updatedTask);
  };

  const handleSelectEvent = (task: Task) => {
    setSelectedTask(task);
    setIsPopupOpen(true);
    setTimerDuration(task.focusTime ? task.focusTime : 25); // Reset focus time duration to default value
    setBreakDuration(task.breakTime ? task.breakTime : 5); // Reset break time to default value
    setIsTimerRunning(false);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedTask(null);
    setIsTimerRunning(false);
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

  const handleStartFocusTimer = () => {
    if (selectedTask) {
      startTimerMutation.mutate(selectedTask.id);
    }
  };

  const handleEndFocusTimer = () => {
    if (focusSessionId) {
      endTimerMutation.mutate(focusSessionId);
    }
  };

  const handleCancelFocusTimer = () => {
    if (focusSessionId) {
      cancelTimerMutation.mutate(focusSessionId);
    }
  };

  return (
    <div className="p-10 mt-12 px-24 bg-blue-300 min-h-screen">
      <DndProvider backend={HTML5Backend}>
        <div className="bg-white shadow p-6" style={{ borderRadius: "20px" }}>
          <DragAndDropCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor={(event) => moment(event.dateTimeSet).toDate() || new Date()}
            endAccessor={(event) => moment(event.dueDateTime).toDate() || new Date()}
            titleAccessor={(event) => event.itemLabel}
            style={{ height: 500 }}
            onEventDrop={handleEventDrop}
            resizable
            onEventResize={handleEventResize}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
          />
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

                {!isTimerRunning ? (
                  <div className="flex gap-4">
                    <button
                      onClick={handleStartFocusTimer}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Start Focus Timer
                    </button>
                    <button
                      onClick={handleClosePopup}
                      className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <button
                      onClick={handleEndFocusTimer}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      End Focus Timer
                    </button>
                    <button
                      onClick={handleCancelFocusTimer}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Cancel Timer
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DndProvider>
    </div>
  );
};

export default DnDCalendar;
