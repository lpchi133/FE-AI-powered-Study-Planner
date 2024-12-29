import React, { useEffect, useState } from "react";
import moment from "moment";
import { Bar, Pie, Line } from "react-chartjs-2";
import useTasks from "../../hooks/useTasksContext";
import { TaskPriority, TaskStatus } from "../../types/task";
import 'chart.js/auto';

interface AnalyticsData {
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
  dailyTimeSpent: Record<string, number>; // Thời gian hàng ngày (giờ)
  totalTimeSpent: number; // Tổng thời gian (giờ)
  totalEstimatedTime: number; // Tổng thời gian ước tính (giờ)
}

const Analytics: React.FC = () => {
  const { tasks } = useTasks();
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
    dailyTimeSpent: {},
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

      const dailyTimeSpent: Record<string, number> = {};
      let totalTimeSpent = 0;
      let totalEstimatedTime = 0;

      tasks.forEach((task) => {
        tasksByStatus[task.itemStatus] += 1;
        tasksByPriority[task.itemPriority] += 1;

        // Calculate the total duration of focusSessions in hours
        const focusSessionsDuration = task.focusSessions
          ? task.focusSessions.reduce((total, session) => total + session.duration, 0) / 60
          : 0;

        const start = moment(task.dateTimeSet);
        const end = moment(task.dueDateTime);

        const dateKey = start.format("YYYY-MM-DD");
        dailyTimeSpent[dateKey] = (dailyTimeSpent[dateKey] || 0) + focusSessionsDuration;

        totalTimeSpent += focusSessionsDuration;
        totalEstimatedTime += Math.max(end.diff(start, "hours", true), 0);
      });

      setAnalyticsData({
        totalTasks: tasks.length,
        tasksByStatus,
        tasksByPriority,
        dailyTimeSpent,
        totalTimeSpent,
        totalEstimatedTime,
      });
    };

    analyzeTasks();
  }, [tasks]);

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const minutes = Math.floor((hours - h) * 60);
    return `${h}h ${minutes}m`;
  };

  const tasksByStatusData = {
    labels: Object.keys(analyticsData.tasksByStatus),
    datasets: [
      {
        label: 'Tasks by Status',
        data: Object.values(analyticsData.tasksByStatus),
        backgroundColor: ['#4caf50', '#ffeb3b', '#f44336', '#2196f3', '#ff9800'],
      },
    ],
  };

  const tasksByPriorityData = {
    labels: Object.keys(analyticsData.tasksByPriority),
    datasets: [
      {
        label: 'Tasks by Priority',
        data: Object.values(analyticsData.tasksByPriority),
        backgroundColor: ['#f44336', '#2196f3', '#4caf50'],
      },
    ],
  };

  const dailyTimeSpentData = {
    labels: Object.keys(analyticsData.dailyTimeSpent),
    datasets: [
      {
        label: 'Daily Time Spent (hours)',
        data: Object.values(analyticsData.dailyTimeSpent),
        fill: false,
        borderColor: '#4caf50',
        tension: 0.1,
      },
    ],
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
          <h2 className="text-lg font-bold text-gray-800">Total Estimated Time</h2>
          <p className="text-3xl font-semibold text-red-600">
            {formatTime(analyticsData.totalEstimatedTime)}
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
        <h2 className="text-lg font-bold text-gray-800">Daily Time Spent</h2>
        <Line data={dailyTimeSpentData} />
      </div>
    </div>
  );
};

export default Analytics;