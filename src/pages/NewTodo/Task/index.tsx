import { Form } from "react-bootstrap";
import useTasks from "../../../hooks/useTasksContext";
import "./index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { LONG_DATE } from "../../../utils/constants";
import StatusCell from "./Status";
import events, { EventKeys } from "../../../utils/eventBus";

type Props = {
  taskId: number;
  isSelected: boolean;
  isDisabled?: boolean;
  isAllowEdit?: boolean;
  isArchived?: boolean;
  onToggle: () => void;
};

const TaskItem = ({ taskId, isSelected, isDisabled, onToggle, isAllowEdit, isArchived }: Props) => {
  const { getTaskById } = useTasks();
  const task = getTaskById(taskId);
  if(!task) return null;

  const onEdit = () => {
    events.openModal(EventKeys.editTaskModal,{
      task
    })
  };
  const removeItem = () => {
     events.openModal(EventKeys.deleteTaskModal,{
      task
    })
  }

  return (
    <tr className="active">
      <th className={isArchived || isSelected ? "strikeThrough" : ""} scope="row">
        <div>
          <Form className="mb-3">
            <Form.Group controlId="formBasicCheckbox">
              <Form.Check disabled={isDisabled} type="checkbox" checked={isSelected} onChange={onToggle} />
            </Form.Group>
          </Form>
        </div>
      </th>
      {isAllowEdit && (
        <td>
          <FontAwesomeIcon icon={faEdit} onClick={onEdit} />
        </td>
      )}
      <td className={isArchived || isSelected ? "strikeThrough" : ""}>
        <div>{task.itemLabel}</div>
      </td>
      <td className={isArchived || isSelected ? "strikeThrough" : ""}>
        <div>{task.itemPriority}</div>
      </td>
      <td className={isArchived || isSelected ? "strikeThrough" : ""}>
        <div>{moment(task.dateTimeSet).format(LONG_DATE)}</div>
      </td>
      <td className={isArchived || isSelected ? "strikeThrough" : ""}>
            <StatusCell status={task.itemStatus} />
      </td>
      <td className={isArchived || isSelected ? "strikeThrough" : ""}>
        <div>{task.itemDescription}</div>
      </td>
      <td className={isArchived || isSelected ? "strikeThrough" : ""}>
        <div>{moment(task.dueDateTime).format(LONG_DATE)}</div>
      </td>
      <td>
        <FontAwesomeIcon icon={faTrashAlt} onClick={removeItem} />
      </td>
    </tr>
  );
};

export default TaskItem;
