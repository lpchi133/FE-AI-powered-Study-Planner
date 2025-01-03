import React, { useEffect, useState } from "react";
import moment from "moment";
import { Bar, Pie } from "react-chartjs-2";
import useTasks from "../../hooks/useTasksContext";
import { TaskPriority, TaskStatus } from "../../types/task";
import "chart.js/auto";
import BarChart from "../Charts/BarChart";
import LineChart from "../Charts/LineChart";
import PieChart from "../Charts/PieChart";
import { Button, Form, InputGroup } from "react-bootstrap";
import { faSearch, faRedoAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface AnalyticsData {
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
  dailyTaskTimeSpent: Record<string, Record<number, number>>; // Time spent on each task per day (seconds)
  totalTimeSpent: number; // Total time spent (seconds)
  totalEstimatedTime: number; // Total estimated time (hours)
}

const Analytics: React.FC = () => {
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
    <div className="bg-blue-300 pt-24 px-16 pb-16">
      <div className="flex" style={{ width: "100%" }}>
        <div style={{ width: "15%" }} className="mr-24">
          <Form.Group controlId="validationSelect">
            <Form.Select aria-label="Select time range" className="form-select">
              <option value="1">Today</option>
              <option value="2">This week</option>
              <option value="3">This month</option>
              <option value="4">This year</option>
            </Form.Select>
          </Form.Group>
        </div>

        <div className="flex space-x-3 mr-48" style={{ width: "35%" }}>
          <Form.Group controlId="validationFromDate" style={{ width: "260px" }}>
            <InputGroup>
              <InputGroup.Text id="inputGroupPrepend1">From</InputGroup.Text>
              <Form.Control
                type="datetime-local"
                // {...methods.register("fromDate")}
                aria-describedby="inputGroupPrepend1"
              />
              <Form.Control.Feedback type="invalid">
                Please choose a proper date.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <Form.Group controlId="validationToDate" style={{ width: "260px" }}>
            <InputGroup>
              <InputGroup.Text id="inputGroupPrepend2">To</InputGroup.Text>
              <Form.Control
                type="datetime-local"
                // {...methods.register("toDate")}
                aria-describedby="inputGroupPrepend2"
              />
              <Form.Control.Feedback type="invalid">
                Please choose a proper date.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </div>

        <div className="flex justify-end space-x-3" style={{ width: "30%" }}>
          <Form.Group controlId="validationSubmit" style={{ width: "30%" }}>
            <Button
              className="search-btn btn-block"
              variant="primary"
              type="submit"
            >
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </Form.Group>

          <Form.Group controlId="validationReset" style={{ width: "30%" }}>
            <Button
              className="search-btn btn-block"
              variant="danger"
              type="reset"

              // onClick={onRefresh}
            >
              <FontAwesomeIcon icon={faRedoAlt} />
            </Button>
          </Form.Group>
        </div>
      </div>

      <div className=" bg-white shadow p-7 rounded-lg mt-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Board</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-bold text-gray-800">Total Tasks</h2>
            <p className="text-3xl font-semibold text-blue-600">
              {analyticsData.totalTasks}
            </p>
          </div>
          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-bold text-gray-800">
              Total Time Spent
            </h2>
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
            <h2 className="text-lg font-bold text-gray-800">
              Tasks by Priority
            </h2>
            <Bar data={tasksByPriorityData} />
          </div>
        </div>
      </div>

      <div className="flex bg-white shadow p-7 rounded-lg mt-8">
        <PieChart />
        <div
          className="flex justify-center ml-7 py-6 pl-6 pr-3 rounded-lg border-2 border-blue-300"
          style={{ width: "61%", height: "500px" }}
        >
          <div
            className="flex flex-col items-start"
            style={{ overflowY: "auto" }}
          >
            <div className="text-xl font-bold text-blue-600 mb-2">
              ✨ AI-powered Feedback:
            </div>
            <div className="mr-2">
              AI-powered Study Planner PROJECT IDEA & PURPOSE The AI-powered
              Study Planner is a web application designed to help students and
              lifelong learners manage their study schedules effectively. It
              leverages AI to enhance user experience by providing personalized
              feedback and insights, optimizing learning efficiency, and
              ensuring sustainable time management. CORE FEATURES Authentication
              & Profile Management Sign Up: Create an account using email and
              password or social sign-in. Login: Access accounts via
              email/password or social sign-in. Logout: Securely terminate user
              sessions. Update full name, profile picture, and password.
              Scheduling & Task Management Task Management: Users click on the
              “Add Task” button and input some fields such as task name,
              description, priority level (High/Medium/Low), estimated time,
              status (Todo/In Progress/Completed/Expired) Users can view the
              list of tasks, search tasks, filter, or sort them based on their
              priority and status. Users can click on any specific task to
              update or delete it from the task list. Task Scheduling (Calendar
              view): Users distribute tasks into available time slots by
              dragging and dropping tasks onto a calendar interface. The status
              of the tasks can be automatically updated if these tasks are
              distributed on the calendar. For example, The task is “Todo” but
              if the users drag it to the past, it becomes “Expired”. AI
              Suggestions: Users click on “Analyze Schedule" to send task data,
              and schedule details to an LLM. Provide feedback on potential
              adjustments, such as: Warning about overly tight schedules that
              may lead to burnout. Recommending prioritization changes for
              improved focus and balance. Focus Timer Start the focus timer:
              Users choose a task on the calendar interface, set timer duration
              (e.g., 25 minutes for a Pomodoro session) and optional break
              duration (e.g. 5 minutes), and then start a timer for that task to
              track focus sessions. Display session duration and provide visual
              cues like a countdown or progress bar. During the timer session:
              Users focus on the task while the timer runs and can not use other
              in-app features. They can end the timer early if needed. End of
              the timer session: At the end of the timer session, users receive
              a notification that the session is complete. They can mark the
              task as completed, start the break timer, or restart the focus
              timer for another session. Note and edge cases: Prevent starting
              the timer for tasks that are not “In progress”. If the task
              deadline is met before the timer ends, end the timer immediately
              and notify the user.
            </div>
          </div>
        </div>
      </div>

      <div className=" bg-white shadow p-7 rounded-lg mt-8">
        <h2 className="text-lg font-bold text-gray-800">
          Time Spent on Each Task by Day
        </h2>
        <div className="flex justify-center">
          <div style={{ width: "100%", height: "400px" }}>
            <Bar data={dailyTaskTimeSpentData} />
          </div>
        </div>
      </div>

      <BarChart />
      <LineChart />
    </div>
  );
};

export default Analytics;
