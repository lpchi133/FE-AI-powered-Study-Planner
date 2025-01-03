import React, { useEffect, useState } from "react";
import moment from "moment";
import { Bar, Pie } from "react-chartjs-2";
import useTasks from "../../hooks/useTasksContext";
import { TaskPriority, TaskStatus } from "../../types/task";
import "chart.js/auto";

interface AnalyticsData {
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
  dailyTaskTimeSpent: Record<string, Record<number, number>>; // Time spent on each task per day (seconds)
  totalTimeSpent: number; // Total time spent (seconds)
  totalEstimatedTime: number; // Total estimated time (hours)
}

const Dashboard: React.FC = () => {
  const { tasks, getFocusSessionsByTaskId } = useTasks();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalTasks: 0,
    tasksByStatus: {
      [TaskStatus.Completed]: 0,
      [TaskStatus.Overdue]: 0,
      [TaskStatus.NotStarted]: 0,
      [TaskStatus.OnGoing]: 0,
    },
    tasksByPriority: {
      [TaskPriority.High]: 0,
      [TaskPriority.Medium]: 0,
      [TaskPriority.Low]: 0,
    },
    dailyTaskTimeSpent: {},
    totalTimeSpent: 0,
    totalEstimatedTime: 0,
  });

  useEffect(() => {
    const analyzeTasks = () => {
      const tasksByStatus: Record<TaskStatus, number> = {
        [TaskStatus.Completed]: 0,
        [TaskStatus.Overdue]: 0,
        [TaskStatus.NotStarted]: 0,
        [TaskStatus.OnGoing]: 0,
      };

      const tasksByPriority: Record<TaskPriority, number> = {
        [TaskPriority.High]: 0,
        [TaskPriority.Medium]: 0,
        [TaskPriority.Low]: 0,
      };

      const dailyTaskTimeSpent: Record<string, Record<number, number>> = {};
      let totalTimeSpent = 0;
      let totalEstimatedTime = 0;

      tasks.forEach((task) => {
        tasksByStatus[task.itemStatus] += 1;
        tasksByPriority[task.itemPriority] += 1;

        // Calculate the total duration of focusSessions in seconds
        const focusSessions = getFocusSessionsByTaskId(task.id) || [];
        focusSessions.forEach((session) => {
          const dateKey = moment(session.startedAt).format("YYYY-MM-DD");
          if (!dailyTaskTimeSpent[dateKey]) {
            dailyTaskTimeSpent[dateKey] = {};
          }
          dailyTaskTimeSpent[dateKey][task.id] =
            (dailyTaskTimeSpent[dateKey][task.id] || 0) + session.duration;
        });

        const duration = focusSessions.reduce(
          (total, session) => total + session.duration,
          0
        );
        totalTimeSpent += duration;
        totalEstimatedTime += Math.max(
          moment(task.dueDateTime).diff(
            moment(task.dateTimeSet),
            "hours",
            true
          ),
          0
        );
      });

      setAnalyticsData({
        totalTasks: tasks.length,
        tasksByStatus,
        tasksByPriority,
        dailyTaskTimeSpent,
        totalTimeSpent,
        totalEstimatedTime,
      });
    };

    analyzeTasks();
  }, [tasks, getFocusSessionsByTaskId]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  };

  const tasksByStatusData = {
    labels: Object.keys(analyticsData.tasksByStatus),
    datasets: [
      {
        label: "Tasks by Status",
        data: Object.values(analyticsData.tasksByStatus),
        backgroundColor: [
          "#4caf50",
          "#ffeb3b",
          "#f44336",
          "#2196f3",
          "#ff9800",
        ],
      },
    ],
  };

  const tasksByPriorityData = {
    labels: Object.keys(analyticsData.tasksByPriority),
    datasets: [
      {
        label: "Tasks by Priority",
        data: Object.values(analyticsData.tasksByPriority),
        backgroundColor: ["#f44336", "#2196f3", "#4caf50"],
      },
    ],
  };

  const dailyTaskTimeSpentData = {
    labels: Object.keys(analyticsData.dailyTaskTimeSpent),
    datasets: tasks.map((task) => ({
      label: task.itemLabel || `Task ${task.id}`,
      data: Object.keys(analyticsData.dailyTaskTimeSpent).map(
        (date) => analyticsData.dailyTaskTimeSpent[date][task.id] || 0
      ),
      backgroundColor: "#4caf50",
    })),
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Board</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-bold text-gray-800">Total Tasks</h2>
          <p className="text-3xl font-semibold text-blue-600">
            {analyticsData.totalTasks}
          </p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-bold text-gray-800">Total Time Spent</h2>
          <p className="text-3xl font-semibold text-green-600">
            {formatTime(analyticsData.totalTimeSpent)}
          </p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-bold text-gray-800">
            Total Estimated Time
          </h2>
          <p className="text-3xl font-semibold text-red-600">
            {formatTime(analyticsData.totalEstimatedTime * 3600)}{" "}
            {/* Convert hours to seconds */}
          </p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-bold text-gray-800">Tasks by Status</h2>
          <Pie data={tasksByStatusData} />
        </div>
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-bold text-gray-800">Tasks by Priority</h2>
          <Bar data={tasksByPriorityData} />
        </div>
      </div>
      <div className="mt-8 bg-white p-6 shadow rounded-lg">
        <h2 className="text-lg font-bold text-gray-800">
          Time Spent on Each Task by Day
        </h2>
        <div className="flex justify-center">
          <div style={{ width: "100%", height: "400px" }}>
            <Bar data={dailyTaskTimeSpentData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;