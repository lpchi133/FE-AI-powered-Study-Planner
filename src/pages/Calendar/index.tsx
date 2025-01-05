import { useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
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
import { Task, TaskPriority, TaskStatus } from "../../types/task";
import FocusBreakTimer from "../../components/FocusBreakTimer";
import { useTimer } from "../../hooks/useTimerContext";
import { toast } from "react-toastify";

const DragAndDropCalendar = withDragAndDrop<Task>(Calendar);

const DnDCalendar: React.FC = () => {
  const { post } = useAxios();
  const { tasks } = useTasks();
  const { isFinish, handleFinish } = useTimer();
  const queryClient = useQueryClient();
  const [calendarEvents, setCalendarEvents] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

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
        dateTimeSet: moment(updatedTask.dateTimeSet).format("YYYY-MM-DD"),
        dueDateTime: moment(updatedTask.dueDateTime).format("YYYY-MM-DD"),
      });
      return response.data;
    },
    onSuccess: (updatedTask) => {
      // Optionally refetch tasks to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      if (!updatedTask) return;
      // Optimistically update the calendar events
      setCalendarEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === updatedTask?.id ? updatedTask : event
        )
      );
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
    handleFinish();
  };

  const handleClosePopup = () => {
    if (isFinish) {
      setSelectedTask(null);
      setIsTimerRunning(false);
    } else {
      toast.error("Please finish the current session!");
    }
  };

  const handleFocusTimeChange = (time: number) => {
    if (selectedTask && isFinish) {
      setSelectedTask((prevTask) => {
        if (!prevTask) return prevTask;
        return {
          ...prevTask,
          focusTime: time,
        };
      });
    }
  };

  const handleBreakTimeChange = (time: number) => {
    if (selectedTask && isFinish) {
      setSelectedTask((prevTask) => {
        if (!prevTask) return prevTask;
        return {
          ...prevTask,
          breakTime: time,
        };
      });
    }
  };

  const localizer = momentLocalizer(moment);

  const statusColors: Record<string, string> = {
    [TaskStatus.Overdue]: "#ef4444", // Red
    [TaskStatus.Completed]: "#22c55e", // Green
    [TaskStatus.NotStarted]: "#9ca3af", // Gray
    [TaskStatus.OnGoing]: "#3b82f6", // Blue
  };

  const priorityBorderColors: Record<string, string> = {
    [TaskPriority.Low]: "#22c55e", // Green
    [TaskPriority.Medium]: "#eab308", // Yellow
    [TaskPriority.High]: "#ef4444", // Red
  };

  const eventStyleGetter = (event: Task) => {
    const backgroundColor = statusColors[event.itemStatus] || "#d1d5db"; // Default to gray
    const borderColor =
      priorityBorderColors[event.itemPriority] || "transparent";

    return {
      style: {
        backgroundColor,
        color: "white",
        padding: "0px 5px",
        border: `2px solid ${borderColor}`, // Border for priority
        borderRadius: "5px",
      },
    };
  };

  return (
    <div className="px-16 pb-16 pt-24 bg-blue-300 min-h-screen">
      <DndProvider backend={HTML5Backend}>
        <div className="bg-white shadow p-6 rounded-lg">
          <DragAndDropCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor={(event) =>
              moment(event.dateTimeSet).toDate() || new Date()
            }
            endAccessor={(event) =>
              moment(event.dueDateTime).toDate() || new Date()
            }
            titleAccessor={(event) => event.itemLabel}
            style={{ height: 500 }}
            onEventDrop={handleEventDrop}
            resizable
            onEventResize={handleEventResize}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
          />

          {selectedTask && !isTimerRunning && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-md relative">
                <button
                  onClick={handleClosePopup}
                  className="absolute top-6 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <h5 className="font-semibold mb-4 text-center text-gray-800">
                  {selectedTask.itemLabel}
                </h5>
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
                  {moment(selectedTask.dateTimeSet).format("LLL")}
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Due Date:</strong>{" "}
                  {moment(selectedTask.dueDateTime).format("LLL")}
                </p>
                <button
                  onClick={() => setIsTimerRunning(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Start Focus Time
                </button>
              </div>
            </div>
          )}

          {isTimerRunning && selectedTask && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-md relative">
                {/* close button */}
                <button
                  onClick={handleClosePopup}
                  className="absolute top-6 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <h5 className="font-semibold mb-4 text-center text-gray-800">
                  {selectedTask.itemLabel}
                </h5>

                <div className="flex justify-between mb-4">
                  <div className="w-1/2 pr-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Focus Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={selectedTask.focusTime ?? 0}
                      onChange={(e) =>
                        handleFocusTimeChange(Number(e.target.value))
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="w-1/2 pl-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Break Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={selectedTask.breakTime ?? 0}
                      onChange={(e) =>
                        handleBreakTimeChange(Number(e.target.value))
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
                <FocusBreakTimer
                  initialFocusTime={(selectedTask.focusTime ?? 25) * 60} // Convert minutes to seconds
                  initialBreakTime={(selectedTask.breakTime ?? 5) * 60} // Convert minutes to seconds
                  task={selectedTask}
                  onClose={handleClosePopup}
                />
              </div>
            </div>
          )}
          <div className="mt-4">
            <h4 className="font-semibold text-lg mb-4">Legend</h4>

            {/* Status Legend */}
            <div className="mb-4">
              <h5 className="font-medium mb-2">Status Colors:</h5>
              <ul className="flex space-x-4">
                <li className="flex items-center">
                  <span
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: "#ef4444" }}
                  ></span>
                  Overdue
                </li>
                <li className="flex items-center">
                  <span
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: "#22c55e" }}
                  ></span>
                  Completed
                </li>
                <li className="flex items-center">
                  <span
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: "#9ca3af" }}
                  ></span>
                  Not Started
                </li>
                <li className="flex items-center">
                  <span
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: "#3b82f6" }}
                  ></span>
                  Ongoing
                </li>
              </ul>
            </div>

            {/* Priority Legend */}
            <div>
              <h5 className="font-medium mb-2">Priority Borders:</h5>
              <ul className="flex space-x-4">
                <li className="flex items-center">
                  <span
                    className="w-4 h-4 rounded-full mr-2"
                    style={{
                      border: "2px solid #22c55e",
                      backgroundColor: "transparent",
                    }}
                  ></span>
                  Low Priority
                </li>
                <li className="flex items-center">
                  <span
                    className="w-4 h-4 rounded-full mr-2"
                    style={{
                      border: "2px solid #eab308",
                      backgroundColor: "transparent",
                    }}
                  ></span>
                  Medium Priority
                </li>
                <li className="flex items-center">
                  <span
                    className="w-4 h-4 rounded-full mr-2"
                    style={{
                      border: "2px solid #ef4444",
                      backgroundColor: "transparent",
                    }}
                  ></span>
                  High Priority
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DndProvider>
    </div>
  );
};

export default DnDCalendar;
