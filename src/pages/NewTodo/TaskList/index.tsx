import { Image } from "react-bootstrap";
import logo from "../../../../public/images/preview.jpg";
import useTasks from "../../../hooks/useTasksContext";
import TaskItem from "../Task";
import "./index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortDown,
  faSortUp,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { TaskPriority, TaskStatus, type Task } from "../../../types/task";

import moment from "moment";
import { useWebSocket } from "../../../hooks/useWebSocket";

type Props = {
  taskIds: number[];
  isArchive?: boolean;
  emptyCaption: () => React.ReactNode;
};

type StateType = {
  currentSort: keyof Task;
  sortType: Record<string, "asc" | "" | "desc">;
};

const TaskList = ({ taskIds, isArchive, emptyCaption }: Props) => {
  const { getTaskMap, updateTask } = useTasks();
  const taskMap = getTaskMap();
  const [selectedIds, setSelectedId] = useState<number[]>([]);
  const [state, setState] = useState<StateType>({
    currentSort: "dueDateTime",
    sortType: {
      itemLabel: "",
      itemPriority: "",
      dateTimeSet: "",
      itemStatus: "",
      dueDateTime: "asc",
    },
  });

  useWebSocket();

  const getSortIcon = (val: string) => {
    if (state.currentSort === val) {
      const sortOrder = state.sortType[val];
      if (sortOrder === "asc") {
        return <FontAwesomeIcon icon={faSortUp}></FontAwesomeIcon>;
      } else if (sortOrder === "desc") {
        return <FontAwesomeIcon icon={faSortDown}></FontAwesomeIcon>;
      } else {
        return <FontAwesomeIcon icon={faSort}></FontAwesomeIcon>;
      }
    } else {
      return <FontAwesomeIcon icon={faSort}></FontAwesomeIcon>;
    }
  };

  const compareValues = (key: keyof Task, order: string) => {
    return (a: number, b: number) => {
      // Kiểm tra xem a và b có thuộc tính key hay không
      const aTask = taskMap[a];
      const bTask = taskMap[b];

      if (!aTask || !bTask) return 0;
      if (order === "") return 0;

      const valueA = aTask[key];
      const valueB = bTask[key];

      // Nếu key là priority, so sánh ưu tiên
      if (key === "itemPriority") {
        const priorityOrder = {
          [TaskPriority.High]: 3,
          [TaskPriority.Medium]: 2,
          [TaskPriority.Low]: 1,
        };
        const priorityA = priorityOrder[valueA as TaskPriority] || 0;
        const priorityB = priorityOrder[valueB as TaskPriority] || 0;
        console.log(" A", priorityA, " b", priorityB, " ->", valueA, aTask);

        // So sánh theo thứ tự ưu tiên, HIGH > MEDIUM > LOW
        return order === "desc" ? priorityB - priorityA : priorityA - priorityB;
      }

      if (key === "dateTimeSet" || key === "dueDateTime") {
        const dateA = typeof valueA === "string" ? moment(valueA) : null;
        const dateB = typeof valueB === "string" ? moment(valueB) : null;
        if (!dateA || !dateB) return 0;
        return (
          (order === "asc" ? 1 : order === "desc" ? -1 : 0) *
          (dateA.isBefore(dateB) ? -1 : 1)
        );
      }

      // Nếu giá trị là string, sử dụng localeCompare
      if (typeof valueA === "string" && typeof valueB === "string") {
        return order === "desc"
          ? valueB.localeCompare(valueA)
          : valueA.localeCompare(valueB);
      }

      // Nếu giá trị là number, so sánh trực tiếp
      if (typeof valueA === "number" && typeof valueB === "number") {
        return order === "desc" ? valueB - valueA : valueA - valueB;
      }

      return 0; // Nếu các giá trị không phải string hoặc number, trả về 0
    };
  };

  const sortTasks = (val: keyof Task, isTrue: boolean = false) => {
    const newSortType = { ...state.sortType };
    let order = newSortType[val];

    if (isTrue === true) {
      if (newSortType[val] === "asc") {
        order = "desc";
      } else if (newSortType[val] === "desc") {
        order = "";
      } else {
        order = "asc";
      }
    }

    newSortType[val] = order;

    setState({
      sortType: newSortType,
      currentSort: val,
    });
  };

  const onToggleSelect = (id: number) => async () => {
    setSelectedId((prev) => {
      const isSelected = prev.includes(id);
      const updatedSelectedIds = isSelected
        ? prev.filter((_id) => _id !== id)
        : [...prev, id];

      if (!isSelected) {
        const taskToUpdate = taskMap[id];
        if (taskToUpdate) {
          updateTask(id, { itemStatus: TaskStatus.Completed });
        }
      }

      return updatedSelectedIds;
    });
  };

  taskIds.sort(
    compareValues(state.currentSort, state.sortType[state.currentSort])
  );
  return (
    <div className={!isArchive ? "todo-table" : ""}>
      {taskIds.length !== 0 ? (
        <table className="table table-borderless table-responsive">
          <thead className="thead-light">
            <tr className="head">
              <th scope="col"></th>
              {!isArchive && <th scope="col"></th>}
              <th onClick={() => sortTasks("itemLabel", true)} scope="col">
                <div className="sort-icon">
                  Title
                  {getSortIcon("itemLabel")}
                </div>
              </th>
              <th onClick={() => sortTasks("itemPriority", true)} scope="col">
                <div className="sort-icon">
                  Priority
                  {getSortIcon("itemPriority")}
                </div>
              </th>
              <th onClick={() => sortTasks("dateTimeSet", true)} scope="col">
                <div className="sort-icon">
                  Start Date
                  {getSortIcon("dateTimeSet")}
                </div>
              </th>

              <th onClick={() => sortTasks("itemStatus", true)} scope="col">
                <div className="sort-icon">
                  Status
                  {getSortIcon("itemStatus")}
                </div>
              </th>
              <th scope="col" className="des-column">
                Description
              </th>
              <th
                onClick={() => sortTasks("dueDateTime", true)}
                scope="col"
                className="end-date-column"
              >
                <div className="sort-icon">
                  End Date
                  {getSortIcon("dueDateTime")}
                </div>
              </th>

              <th scope="col" className="end1-date-column"></th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {taskIds.map((id) => {
              return (
                <TaskItem
                  key={id}
                  taskId={id}
                  isSelected={selectedIds.includes(id)}
                  onToggle={onToggleSelect(id)}
                  isAllowEdit={!isArchive}
                  isArchived={isArchive}
                />
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="text-center">
          <Image className="center-image" src={logo} fluid />
          {emptyCaption()}
          {/* <h6 className="text-center">
            All done for now or No result.
            <br />
            Click on add task or Click reset to keep track of your task .
          </h6> */}
        </div>
      )}
    </div>
  );
};

export default TaskList;
