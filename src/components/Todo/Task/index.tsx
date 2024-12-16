import React from 'react';
import Form from 'react-bootstrap/Form';
import EditTask from '../EditTask';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import './Task.css';

// interface Date {
//   yyyymmdd(): string;
// }


Date.prototype.yyyymmdd = function(): string {
  const mm = this.getMonth() + 1;
  const dd = this.getDate();

  return [
    this.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
  ].join('-');
};

interface TaskProps {
  id: string;
  priority: string;
  desc: string;
  status: string;
  label: string;
  start_date: string;
  start_time: string;
  date: string;
  time: string;
  comp: string;
  isDark?: boolean;
  authToken: string | null;
  completedTask: (id: string, date: string, time: string) => void;
  removeItem: (id: string ) => void;
  updateData: () => void;
}

interface TaskState {
  checkBoxChecked: boolean;
  checkBoxDisabled: boolean;
  showEdit: boolean;
  editItem: {
    id: string;
    priority: string;
    description: string;
    status: string;
    label: string;
    date: string;
    start_date: string;
    time: string;
    start_time: string;
  };
}

class Task extends React.Component<TaskProps, TaskState> {
  constructor(props: TaskProps) {
    super(props);
    this.state = {
      checkBoxChecked: false,
      checkBoxDisabled: false,
      showEdit: false,
      editItem: {
        id: this.props.id,
        priority: this.props.priority,
        description: this.props.desc,
        status: this.props.status,
        label: this.props.label,
        date: this.props.date,
        start_date: this.props.start_date,
        time: this.props.time,
        start_time: this.props.start_time,
      }
    };
  }

  componentDidMount() {
    if (this.props.comp === 'Archive') {
      this.setState({
        checkBoxChecked: true,
        checkBoxDisabled: true
      });
    }
  }

  handleCheckBox = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      checkBoxChecked: event.target.checked
    });

    console.log("Checkbox clicked, value:", event.target.checked);
    console.log("completedTask:", this.props.completedTask);
    
    if (event.target.checked) {
      const nowDate = new Date();
      const nowTime = (nowDate.getHours() + ":" + nowDate.getMinutes()).toString();
      this.props.completedTask(this.props.id, nowDate.yyyymmdd().toString(), nowTime);
    }
  };

  prettyStatus = (): JSX.Element => {
    const nowDate = Date.now();
    const dueDate = new Date(this.props.date + " " + this.props.time);
    const val = this.props.status;
    const daysDiff = (dueDate.getTime() - nowDate) / (1000 * 3600 * 24);

    if (val === 'Ongoing') {
      return <div className="btn btn-primary btn-block btn-sm">{val}</div>;
    } else if (val === "Pending") {
      return (
        daysDiff <= 1 ?
        <div className="btn btn-danger btn-block btn-sm">{val}</div> :
        <div className="btn btn-warning btn-block btn-sm">{val}</div>
      );
    } else if (val === "Completed") {
      return <div className="btn btn-success btn-block btn-sm">{val}</div>;
    } else if (val === "Overdue") {
      return <div className="btn btn-secondary btn-block btn-sm">{val}</div>;
    } else if (val === "NotStarted") {
      return <div className="btn btn-info btn-block btn-sm">{val}</div>; // Màu xanh dương nhạt cho "NotStarted"
    } else {
      return <div className="btn btn-light btn-block btn-sm">Unknown</div>;
    }
};


  removeItem = (): void => { 
    this.props.removeItem(this.props.id);
  };

  // completedTask = (): void => { 
  //   this.props.completedTask(this.props.id, this.props.date, this.props.time);
  // };


  toggleEditTask = (): void => {
    this.setState({
      showEdit: !this.state.showEdit
    });
  };

  updateData = (): void => {
    this.props.updateData();
  };

  render(): JSX.Element {
    return (
      <>
        <tr className="active">
          <th className={this.props.comp === 'Archive' ? "strikeThrough" : (!this.state.checkBoxChecked ? "" : "strikeThrough")} scope="row">
            <div>
              <Form className="mb-3">
                <Form.Group controlId="formBasicCheckbox">
                  <Form.Check
                    disabled={this.state.checkBoxDisabled}
                    type="checkbox"
                    checked={this.state.checkBoxChecked}
                    onChange={this.handleCheckBox}
                  />
                </Form.Group>
              </Form>
            </div>
          </th>
          {this.props.comp !== 'Archive' ? (
            <td>
              <FontAwesomeIcon icon={faEdit} onClick={this.toggleEditTask} />
              <EditTask
                show={this.state.showEdit}
                onHide={this.toggleEditTask}
                isDark={this.props.isDark}
                authToken={this.props.authToken}
                editTask={this.state.editItem}
                updateData={this.updateData}
              />
            </td>
          ) : null}
          <td className={this.props.comp === 'Archive' ? "strikeThrough" : (!this.state.checkBoxChecked ? "" : "strikeThrough")}>
            <div>{this.props.label}</div>
          </td>
          <td className={this.props.comp === 'Archive' ? "strikeThrough" : (!this.state.checkBoxChecked ? "" : "strikeThrough")}>
            <div>{this.props.priority}</div>
          </td>
          <td className={this.props.comp === 'Archive' ? "strikeThrough" : (!this.state.checkBoxChecked ? "" : "strikeThrough")}>
            <div>{this.props.start_date}</div>
          </td>
          <td className={this.props.comp === 'Archive' ? "strikeThrough" : (!this.state.checkBoxChecked ? "" : "strikeThrough")}>
            <div>{this.props.start_time}</div>
          </td>
          <td className={this.props.comp === 'Archive' ? "strikeThrough" : (!this.state.checkBoxChecked ? "" : "strikeThrough")}>
            <div>{this.prettyStatus()}</div>
          </td>
          <td className={this.props.comp === 'Archive' ? "strikeThrough" : (!this.state.checkBoxChecked ? "" : "strikeThrough")}>
            <div>{this.props.desc}</div>
          </td>
          <td className={this.props.comp === 'Archive' ? "strikeThrough" : (!this.state.checkBoxChecked ? "" : "strikeThrough")}>
            <div>{this.props.date}</div>
          </td>
          <td className={this.props.comp === 'Archive' ? "strikeThrough" : (!this.state.checkBoxChecked ? "" : "strikeThrough")}>
            <div>{this.props.time}</div>
          </td>
          <td>
            <FontAwesomeIcon icon={faTrashAlt} onClick={this.removeItem} />
          </td>
        </tr>
      </>
    );
  }
}

export default Task;