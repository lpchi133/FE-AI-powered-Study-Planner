import { faRedoAlt, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "chart.js/auto";
import _ from "lodash";
import moment from "moment";
import React, { useMemo } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { Bar, Line, Pie } from "react-chartjs-2";
import useTasks from "../../hooks/useTasksContext";
import { Task, TaskStatus } from "../../types/task";
import { formatTime } from "../../utils/helpers";
import AIFeedBack from "./AIFeedBack";

const Analytics: React.FC = () => {
  const { tasks, getTaskMap } = useTasks();

  const taskMap = getTaskMap();
  const analyticsStatusData = useMemo(() => {
    return _.groupBy(tasks, "itemStatus");
  }, [tasks]);
  const analyticsPriorityData = useMemo(() => {
    return _.groupBy(tasks, "itemPriority");
  }, [tasks]);

  const taskSpentTime = useMemo(() => {
    const dailyTaskTimeSpent: Record<string, Record<string, number>> = {};
    let totalTimeSpent = 0;
    let totalEstimatedTime = 0;
    tasks.forEach((task) => {
      // Calculate the total duration of focusSessions in seconds
      const focusSessions = task?.focusSessions || [];
      focusSessions.forEach((session) => {
        const date = moment(session.startedAt).format("YYYY-MM-DD");
        if (!dailyTaskTimeSpent[date]) {
          dailyTaskTimeSpent[date] = {};
        }
        dailyTaskTimeSpent[date][task.id] =
          (dailyTaskTimeSpent[date][task.id] || 0) + session.duration;
      });

      const duration = focusSessions.reduce(
        (total, session) => total + session.duration,
        0
      );
      totalTimeSpent += duration;
      totalEstimatedTime += Math.max(
        moment(task.dueDateTime).diff(moment(task.dateTimeSet), "hours", true),
        0
      );
    });
    return {
      dailyTaskTimeSpent,
      totalTimeSpent,
      totalEstimatedTime,
    };
  }, [tasks]);

  const focusTimePerTask = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        const focusSessions = task?.focusSessions || [];
        const focusTime = focusSessions.reduce(
          (total, { startedAt, endedAt }) =>
            total +
            (!startedAt || !endedAt
              ? 0
              : moment(endedAt).diff(moment(startedAt), "seconds")),
          0
        );
        return {
          ...acc,
          [task.id]: focusTime,
        };
      },
      {} as Record<string, number>
    );
  }, [tasks]);

  const overtimeTasksByMonth = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        const dueDate = moment(task.dueDateTime);
        const month = dueDate.format("YYYY-MM");
        if (!acc[month]) {
          acc[month] = [];
        }
        if (task.itemStatus === TaskStatus.Overdue) {
          acc[month].push(task);
        }
        return acc;
      },
      {} as Record<string, Task[]>
    );
  }, [tasks]);
  const tasksByStatusData = useMemo(() => {
    return {
      labels: Object.keys(analyticsStatusData),
      datasets: [
        {
          label: "Tasks quantity",
          data: Object.keys(analyticsStatusData).map(
            (key) => analyticsStatusData[key].length
          ),
        },
      ],
    };
  }, [analyticsStatusData]);

  const tasksByPriorityData = useMemo(() => {
    const datsets = Object.keys(analyticsPriorityData).map((key) => {
      return {
        label: key,
        data: [analyticsPriorityData[key].length],
      };
    });
    return {
      labels: ["Priority"],
      datasets: datsets,
    };
  }, [analyticsPriorityData]);

  const dailyTaskTimeSpentData = useMemo(() => {
    const taskTimePerDay = Object.keys(taskSpentTime.dailyTaskTimeSpent).reduce(
      (acc, key) => {
        Object.keys(taskSpentTime.dailyTaskTimeSpent[key]).forEach(
          (id: string) => {
            if (!acc[id]) {
              acc[id] = {};
            }
            acc[id][key] = taskSpentTime.dailyTaskTimeSpent[key][id];
          }
        );
        return acc;
      },
      {} as Record<string, Record<string, number>>
    );
    const datasets = Object.keys(taskTimePerDay).map((key) => {
      return {
        label: `${key} - ${taskMap[+key]?.itemLabel}`,
        data: Object.keys(taskSpentTime.dailyTaskTimeSpent).map(
          (date: string) =>
            taskTimePerDay[key] ? (taskTimePerDay[key][date] ?? 0) : 0
        ),
        stack: key,
      };
    });
    return {
      labels: Object.keys(taskSpentTime.dailyTaskTimeSpent),
      datasets: datasets,
    };
  }, [taskSpentTime.dailyTaskTimeSpent, taskMap]);

  const focusTimePerTaskData = useMemo(() => {
    return {
      labels: Object.keys(focusTimePerTask).map(
        (key) => `${key} - ${taskMap[+key]?.itemLabel}`
      ),
      datasets: [
        {
          label: "Focus Time",
          data: Object.keys(focusTimePerTask).map(
            (key) => focusTimePerTask[key]
          ),
        },
      ],
    };
  }, [focusTimePerTask, taskMap]);

  const overtimeTasksByMonthData = useMemo(() => {
    const sortedKeys = Object.keys(overtimeTasksByMonth).sort((a, b) =>
      moment(a).diff(moment(b))
    );

    return {
      labels: sortedKeys,
      datasets: [
        {
          label: "Overtime Tasks",
          data: sortedKeys.map((key) => overtimeTasksByMonth[key].length),
        },
      ],
    };
  }, [overtimeTasksByMonth]);

  return (
    <div className="bg-blue-300 pt-24 px-16 pb-16">
      <div className="flex w-full">
        <div className="mr-24 w-[15%]">
          <Form.Group controlId="validationSelect">
            <Form.Select aria-label="Select time range" className="form-select">
              <option value="1">Today</option>
              <option value="2">This week</option>
              <option value="3">This month</option>
              <option value="4">This year</option>
            </Form.Select>
          </Form.Group>
        </div>

        <div className="flex space-x-3 mr-48 w-[36%]">
          <Form.Group controlId="validationFromDate" className="w-[280px]">
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

          <Form.Group controlId="validationToDate" className="w-[260px]">
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

        <div className="flex justify-end space-x-3 w-[30%]">
          <Form.Group controlId="validationSubmit" className="w-[30%]">
            <Button
              className="search-btn btn-block"
              variant="primary"
              type="submit"
            >
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </Form.Group>

          <Form.Group controlId="validationReset" className="w-[30%]">
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
              {tasks.length}
            </p>
          </div>
          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-bold text-gray-800">
              Total Time Spent
            </h2>
            <p className="text-3xl font-semibold text-green-600">
              {formatTime(taskSpentTime.totalTimeSpent)}
            </p>
          </div>
          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-bold text-gray-800">
              Total Estimated Time
            </h2>
            <p className="text-3xl font-semibold text-red-600">
              {formatTime(taskSpentTime.totalEstimatedTime * 3600)}
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
      <AIFeedBack />

      <div className=" bg-white shadow p-7 rounded-lg mt-8">
        <h2 className="text-lg font-bold text-gray-800">
          Time Spent on Each Task by Day
        </h2>
        <div className="flex justify-center">
          <div
            style={{ height: "500px", width: "100%" }}
            className="flex justify-center"
          >
            <Bar data={dailyTaskTimeSpentData} />
          </div>
        </div>
      </div>

      <div className=" bg-white shadow p-7 rounded-lg mt-8">
        <h2 className="text-lg font-bold text-gray-800">
          User Focus Time per Task
        </h2>
        <div className="flex justify-center">
          <div
            style={{ height: "500px", width: "100%" }}
            className="flex justify-center"
          >
            <Bar data={focusTimePerTaskData} />
          </div>
        </div>
      </div>
      <div className=" bg-white shadow p-7 rounded-lg mt-8">
        <h2 className="text-lg font-bold text-gray-800">
          Task Frequency Over Time
        </h2>
        <div className="flex justify-center">
          <div
            style={{ height: "500px", width: "100%" }}
            className="flex justify-center"
          >
            <Line data={overtimeTasksByMonthData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
