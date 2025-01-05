import React, { useState, useEffect } from "react";
import { useTimer } from "../../hooks/useTimerContext";
import { Task, TaskStatus } from "../../types/task";
import useAxios from "../../hooks/useAxios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Ably from "ably";

interface FocusBreakTimerProps {
  initialFocusTime: number; // Focus time in seconds
  initialBreakTime: number; // Break time in seconds
  task: Task;
  onClose: () => void;
}

const FocusBreakTimer: React.FC<FocusBreakTimerProps> = ({
  initialFocusTime,
  initialBreakTime,
  task,
  onClose,
}) => {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const { handleFinish, handleReset } = useTimer();
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialFocusTime);
  const [label, setLabel] = useState("Start");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const { post, patch } = useAxios();

  // Ably setup
  useEffect(() => {
    const ably = new Ably.Realtime({
      key: import.meta.env.VITE_ABLY_API_KEY,
    });

    const channel = ably.channels.get("task-updates");

    channel.subscribe("taskDeadlineReached", (message) => {
      const data = message.data as { taskId: number; message: string };
      if (data.taskId === task.id) {
        handleFinish();
        setIsRunning(false);
        task.itemStatus = TaskStatus.Overdue;
        toast.info(data.message);
      }
    });

    return () => {
      channel.unsubscribe();
      ably.close();
    };
  }, [task.id, initialFocusTime, handleFinish, onClose]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (!isRunning && timer) {
      clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  useEffect(() => {
    setTimeLeft(mode === "focus" ? initialFocusTime : initialBreakTime);
  }, [initialBreakTime, initialFocusTime, mode]);

  const endTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await patch(`/focus-timer/${sessionId}/end`, {
        duration: initialFocusTime - timeLeft,
      });
      return response;
    },
    onSuccess: (rs) => {
      setIsRunning(false);
      setMode("break");
      setTimeLeft(initialBreakTime);
      handleFinish();
      setLabel("Start");
      toast.success(rs.message);
    },
    onError: (error) => {
      console.log(error);
      toast.error("Something went wrong! Please try again");
    },
  });

  //when timeLeft is 0, switch to break mode
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsRunning(false);
      if (mode === "focus") {
        endTaskMutation.mutate();
      } else {
        setLabel("Start");
        handleFinish();
        setMode("focus");
        setTimeLeft(initialFocusTime);
        toast.success(`${mode} session ended`);
      }
    }
  }, [timeLeft, isRunning, mode, initialFocusTime, handleFinish]);

  const startTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await post(`/focus-timer/${task.id}/start`, {
        focusTime: initialFocusTime / 60,
        breakTime: initialBreakTime / 60,
      });
      return response;
    },
    onSuccess: (rs) => {
      setSessionId(rs.sessionId);
    },
    onError: (error) => {
      setIsRunning(false);
      handleFinish();
      setTimeLeft(initialFocusTime);
      toast.error(error.message);
    },
  });

  const markCompletedMutation = useMutation({
    mutationFn: async () => {
      const response = await post(`/tasks/updateTaskStatus`, {
        id: task.id,
        itemStatus: "Completed",
      });
      return response;
    },
    onSuccess: () => {
      task.itemStatus = TaskStatus.Completed;
      toast.success("Task marked as completed");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  //when start button is clicked, start the timer
  const handleStart = async () => {
    if (label == "Start") {
      if (mode === "focus") {
        if (task.itemStatus !== "OnGoing") {
          toast.error("Task is not in progress");
        } else {
          setIsRunning(true);
          handleReset();
          startTaskMutation.mutate();
        }
      } else {
        setIsRunning(true);
        handleReset();
      }
    } else {
      setIsRunning(true);
      handleReset();
    }
  };

  //when pause button is clicked, stop the timer
  const handlePause = () => {
    setIsRunning(false);
    setLabel("Resume");
  };

  //when stop button is clicked, end the current task
  const handleStop = () => {
    if (mode === "focus") {
      endTaskMutation.mutate();
    } else {
      setIsRunning(false);
      setMode("focus");
      setTimeLeft(initialFocusTime);
      handleFinish();
      setLabel("Start");
      toast.success("Break session ended");
    }
  };

  const handleMarkCompleted = () => {
    markCompletedMutation.mutate();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">
        {mode === "focus" ? "Focus Time" : "Break Time"}
      </h1>
      <div className="text-4xl font-mono">{formatTime(timeLeft)}</div>
      <div className="flex gap-4 mt-4">
        {!isRunning && (
          <>
            {task.itemStatus === "OnGoing" && (
              <button
                onClick={handleMarkCompleted}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Mark Completed
              </button>
            )}

            {task.itemStatus === "Completed" && (
              <button className="px-4 py-2 bg-green-400 text-white rounded-lg">
                Completed
              </button>
            )}

            <button
              onClick={handleStart}
              className="px-10 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {label}
            </button>
          </>
        )}
        {isRunning && (
          <>
            <button
              onClick={handlePause}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Pause
            </button>
            <button
              onClick={handleStop}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Stop
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FocusBreakTimer;
