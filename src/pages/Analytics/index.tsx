import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "chart.js/auto";
import _ from "lodash";
import moment from "moment";
import React, { useMemo, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { Bar, Line, Pie } from "react-chartjs-2";
import { useForm } from "react-hook-form";
import useTasks from "../../hooks/useTasksContext";
import { Task, TaskStatus } from "../../types/task";
import { formatTime } from "../../utils/helpers";
import AIFeedBack from "./AIFeedBack";
import "./index.css";

export enum AnalyticsFilter {
  TODAY = "today",
  THIS_WEEK = "this-week",
  THIS_MONTH = "this-month",
  THIS_YEAR = "this-year",
  CUSTOM = "custom",
}
type AnalyticFilter = {
  type: AnalyticsFilter;
  startDate: string;
  endDate: string;
};

const Analytics: React.FC = () => {
  const { tasks } = useTasks();
  const [activeFilterType, setActiveFilterType] = useState<AnalyticFilter>({
    type: AnalyticsFilter.TODAY,
    startDate: moment().toISOString(),
    endDate: moment().toISOString(),
  });
  const methods = useForm<{ filter: AnalyticFilter }>({
    defaultValues: {
      filter: activeFilterType,
    },
  });

  const filterType = methods.watch("filter.type");
  const filteredTasks = useMemo(() => {
    const { startDate, endDate } = activeFilterType;
    return tasks.filter((task) => {
      const dueDate = moment(task.dueDateTime);
      return dueDate.isBetween(startDate, endDate, "day", "[]");
    });
  }, [tasks, activeFilterType]);
  const taskMap = useMemo(() => {
    return _.keyBy(filteredTasks, "id");
  }, [filteredTasks]);

  const analyticsStatusData = useMemo(() => {
    return _.groupBy(filteredTasks, "itemStatus");
  }, [filteredTasks]);
  const analyticsPriorityData = useMemo(() => {
    return _.groupBy(filteredTasks, "itemPriority");
  }, [filteredTasks]);

  const taskSpentTime = useMemo(() => {
    const dailyTaskTimeSpent: Record<string, Record<string, number>> = {};
    let totalTimeSpent = 0;
    let totalEstimatedTime = 0;
    filteredTasks.forEach((task) => {
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
  }, [filteredTasks]);

  const focusTimePerTask = useMemo(() => {
    return filteredTasks.reduce(
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
  }, [filteredTasks]);

  const overtimeTasksByMonth = useMemo(() => {
    return filteredTasks.reduce(
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
  }, [filteredTasks]);
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

  const onSubmit = (data: { filter: AnalyticFilter }) => {
    setActiveFilterType(data.filter);
  };

  return (
    <div className="bg-blue-300 pt-24 px-16 pb-16 page">
      <Form
        className="flex w-full justify-between mb-8"
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <div className="mr-24 w-[15%] selectionBar">
          <Form.Group>
            <Form.Select
              aria-label="Select time range"
              className="form-select"
              {...methods.register("filter.type", {
                onChange: (e) => {
                  switch (e.target.value) {
                    case AnalyticsFilter.TODAY:
                      methods.setValue(
                        "filter.startDate",
                        moment().toISOString()
                      );
                      methods.setValue(
                        "filter.endDate",
                        moment().toISOString()
                      );
                      break;
                    case AnalyticsFilter.THIS_WEEK:
                      methods.setValue(
                        "filter.startDate",
                        moment().startOf("week").toISOString()
                      );
                      methods.setValue(
                        "filter.endDate",
                        moment().endOf("week").toISOString()
                      );
                      break;
                    case AnalyticsFilter.THIS_MONTH:
                      methods.setValue(
                        "filter.startDate",
                        moment().startOf("month").toISOString()
                      );
                      methods.setValue(
                        "filter.endDate",
                        moment().endOf("month").toISOString()
                      );
                      break;
                    case AnalyticsFilter.THIS_YEAR:
                      methods.setValue(
                        "filter.startDate",
                        moment().startOf("year").toISOString()
                      );
                      methods.setValue(
                        "filter.endDate",
                        moment().endOf("year").toISOString()
                      );
                      break;
                    case AnalyticsFilter.CUSTOM:
                      break;
                  }
                },
              })}
            >
              <option value={AnalyticsFilter.TODAY}>Today</option>
              <option value={AnalyticsFilter.THIS_WEEK}>This week</option>
              <option value={AnalyticsFilter.THIS_MONTH}>This month</option>
              <option value={AnalyticsFilter.THIS_YEAR}>This year</option>
              <option value={AnalyticsFilter.CUSTOM}>Custom</option>
            </Form.Select>
          </Form.Group>
        </div>
        {filterType === AnalyticsFilter.CUSTOM && (
          <div className="flex space-x-3 mr-48 w-[36%] dateBar">
            <Form.Group
              controlId="validationFromDate"
              className="w-[280px] fromDate"
            >
              <InputGroup>
                <InputGroup.Text id="inputGroupPrepend1">From</InputGroup.Text>
                <Form.Control
                  type="datetime-local"
                  {...methods.register("filter.startDate")}
                  aria-describedby="inputGroupPrepend1"
                />
                <Form.Control.Feedback type="invalid">
                  Please choose a proper date.
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group
              controlId="validationToDate"
              className="w-[260px] toDate"
            >
              <InputGroup>
                <InputGroup.Text id="inputGroupPrepend2">To</InputGroup.Text>
                <Form.Control
                  type="datetime-local"
                  // {...methods.register("toDate")}
                  {...methods.register("filter.endDate")}
                  aria-describedby="inputGroupPrepend2"
                />
                <Form.Control.Feedback type="invalid">
                  Please choose a proper date.
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          </div>
        )}

        <div className="flex justify-end space-x-3 w-[30%] buttonBar">
          <Form.Group controlId="validationSubmit" className="w-[30%] btn-bar">
            <Button
              className="search-btn btn-block"
              variant="primary"
              type="submit"
            >
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </Form.Group>
        </div>
      </Form>

      <div className=" bg-white shadow p-7 rounded-lg mt-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Board</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-bold text-gray-800">Total Tasks</h2>
            <p className="text-3xl font-semibold text-blue-600">
              {filteredTasks.length}
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
      <AIFeedBack taskIds={filteredTasks.map((task) => task.id)} />

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
