import { Component } from 'react';
import Task from '../Task';
import AddTask from '../AddTask';
import NavbarAbove from '../Navbar';
import Image from 'react-bootstrap/Image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import Archive from '../Archive';
import logo from '/images/preview.jpg'
import './ViewTask.css';

interface TaskItem {
    id: string;
    itemPriority: string;
    itemDescription: string;
    itemStatus: string;
    itemLabel: string;
    dateTimeSet: string;
    dueDateTime: string; // Giả sử định dạng là chuỗi; có thể điều chỉnh nếu cần
    authToken: string | null;
  }

interface TaskType {
  key: number;
  id: string;
  priority: string;
  description: string;
  status: string;
  label: string;
  date: string;
  start_date: string;
  time: string;
  start_time: string;
  authToken: string | null;
}

interface TodoState {
  showAdd: boolean;
  todoItems: TaskType[];
  completedTodo: TaskType[];
  originalData: TaskType[];
  sortType: {
    priority: 'asc' | 'desc' | '';
    status: 'asc' | 'desc' | '';
    label: 'asc' | 'desc' | '';
    start_date: 'asc' | 'desc' | '';
    start_time: 'asc' | 'desc' | '';
    date: 'asc' | 'desc' | '';
    time: 'asc' | 'desc' | '';
  };
  currentSort: 'priority' | 'status' | 'label' | 'start_date' | 'start_time' | 'date' | 'time';
  username: string;
}

interface TodoProps {
  authToken: string | null;
  isDark: boolean;
  // changeLogin: (data: string | null) => void;
}

class ViewTasks extends Component<TodoProps, TodoState> {
  
  state: TodoState = {
    showAdd: false,
    todoItems: [],
    completedTodo: [],
    originalData: [],
    sortType: {
      priority: '',
      status: '',
      label: '',
      start_date: 'asc',
      start_time: '',
      date: 'asc',
      time: ''
    },
    currentSort: "date",
    username: "",
  };

  updateData = () => {
    const todoData: TaskType[] = [];
    const completed: TaskType[] = [];

    const accessToken = this.props.authToken;
        
    const requestOptions = {
        method: 'GET',
        headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${accessToken}`,
        }
    };

    fetch(`${import.meta.env.VITE_ENDPOINT_URL}/tasks`, requestOptions)
    .then(response => response.json())
    .then(data => {
        
        console.log("Received data:", data); // In ra dữ liệu nhận được

        const OGdata: TaskType[] = [];
        let keyId = 1;

        data.forEach((item: TaskItem) => {
          if (item.dueDateTime && item.itemDescription && item.itemStatus && item.itemLabel && item.dateTimeSet) {
            const newData: TaskType = {
              key: keyId, 
              id: item.id,
              priority: item.itemPriority,
              description: item.itemDescription,
              status: item.itemStatus,
              label: item.itemLabel,
              start_date: item.dateTimeSet.slice(0, 10),
              start_time: item.dateTimeSet.slice(11, 19),
              date: item.dueDateTime.slice(0, 10),
              time: item.dueDateTime.slice(11, 19),
              authToken: this.props.authToken,
            };
            keyId++;
            OGdata.push(newData);
          } else {
            console.error('Invalid item data:', item);
          }
        });
        
        console.log("Processed data:", OGdata); // In ra dữ liệu đã xử lý
        
        this.setState({
          originalData: OGdata
        }, () => {
          this.state.originalData.forEach(item => {
            const nowDate = Date.now();
            const sDate = new Date(item.start_date + " " + item.start_time);
            const dueDate = new Date(item.date + " " + item.time);
            const daysDiff = (dueDate.getTime() - sDate.getTime()) / (1000 * 3600 * 24);

            if(item.status !== 'Completed') {
              if (sDate.getTime() > nowDate) {
                item.status = "NotStarted";
              } else if (daysDiff < 0) {
                item.status = "Overdue";
              } else if (daysDiff <= 2) {
                item.status = "Pending";
              }else {
                item.status = "Ongoing";
            }
              
              todoData.push(item);  
            } else {
              completed.push(item);
            }
          });
      
          this.setState({
              todoItems: todoData,
              completedTodo: completed
          }, () => {
            this.sortTasks(this.state.currentSort);
            this.forceUpdate();
          });
        });
    });
  }

  componentDidMount() {
    this.updateData();
    // this.fetchUsername();
  }

  // fetchUsername = () => {
  //   const accessToken = this.props.authToken;
  //   const requestOptions = {
  //       method: 'POST',
  //       headers: { 
  //           "Content-Type": "application/json",
  //           'Authorization': `Bearer ${accessToken}`,
  //       }
  //   };

  //   fetch(`${import.meta.env.VITE_ENDPOINT_URL}/users/profile`, requestOptions)
  //   .then(response => response.json())
  //   .then(data => {
  //       this.setState({
  //         username: data["first_name"]
  //       });
  //   });
  // }

  toggleAddTask = () => {
    this.setState({ 
      showAdd: !this.state.showAdd
    });
  }

  addNewTask = () => {
    this.updateData();
    this.forceUpdate();
  }

  getSortIcon = (val: string) => {
    if (this.state.currentSort === val) {
        const sortOrder = this.state.sortType[val];
        if (sortOrder === 'asc') {
          return (<FontAwesomeIcon icon={faSortUp}></FontAwesomeIcon>);
        } else if (sortOrder === 'desc') {
          return (<FontAwesomeIcon icon={faSortDown}></FontAwesomeIcon>);
        } else {
          return (<FontAwesomeIcon icon={faSort}></FontAwesomeIcon>);
        }
      } else {
        return (<FontAwesomeIcon icon={faSort}></FontAwesomeIcon>);
      }
  }

  compareValues = (key: keyof TaskType, order: string) => {
    return function innerSort(a: TaskType, b: TaskType) {
      // Kiểm tra xem a và b có thuộc tính key hay không
      if (!(key in a) || !(key in b)) return 0;
  
      const valueA = a[key];
      const valueB = b[key];

      // Nếu key là priority, so sánh ưu tiên
      if (key === 'priority') {
        const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        const priorityA = priorityOrder[valueA as keyof typeof priorityOrder] || 0;
        const priorityB = priorityOrder[valueB as keyof typeof priorityOrder] || 0;

        // So sánh theo thứ tự ưu tiên, HIGH > MEDIUM > LOW
        return (order === 'desc') ? priorityB - priorityA : priorityA - priorityB;
      }
  
      // Nếu giá trị là string, sử dụng localeCompare
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return (order === 'desc') ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB);
      }
  
      // Nếu giá trị là number, so sánh trực tiếp
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return (order === 'desc') ? valueB - valueA : valueA - valueB;
      }
  
      return 0; // Nếu các giá trị không phải string hoặc number, trả về 0
    };
  }
  
  sortTasks = (val: keyof TodoState['sortType'], isTrue: boolean = false) => {
    const newTodo = [...this.state.todoItems];
    const newSortType = { ...this.state.sortType };  // Sử dụng spread để sao chép đối tượng
  
    let order = newSortType[val];
  
    if (isTrue === true) {
      if (newSortType[val] === 'asc') {
        order = 'desc';
      } else {
        order = 'asc';
      }
    }
  
    newTodo.sort(this.compareValues(val, order));
    newSortType[val] = order;
  
    this.setState({
      todoItems: newTodo,
      sortType: newSortType,
      currentSort: val
    });
  };
  

  completedTask = (id: string, date: string, time: string) => {
    this.state.todoItems.forEach(item => {
      
      if(id.toString().localeCompare(item.id.toString()) === 0) {
        item.status = "Completed";
        item.date = date;
        const formattedTime = time.padStart(5, '0');
        item.time = formattedTime;

        const updateItem = {
          "id": item.id,
          "description": item.description,
          "priority": item.priority, 
          "status": item.status,
          "label": item.label,
          "start_date": item.start_date,
          "start_time": item.start_time,
          "date": item.date,
          "time": item.time,
        }

        const accessToken = this.props.authToken;
        
        const requestOptions = {
            method: 'POST',
            headers: { 
                "Content-Type": "application/json",
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(updateItem) 
        };

        fetch(`${import.meta.env.VITE_ENDPOINT_URL}/tasks/updateTask`, requestOptions)
        .then(response => {
          if(response.status !== 201) {
              alert("There was some problem with that. We're currently working on fixing it. Thank You.");
          }
        });
      }
    });

    setTimeout(() => {
      this.updateData();
    }, 1);
  }

  searchFunction = (title: string, fromDate: string, toDate: string, val: number = 1) => {
    if (val === 1) {
      const newTodo: TaskType[] = [];
      const completed: TaskType[] = [];
  
      this.state.originalData.forEach(item => {
        const current = new Date(item.date + " 00:00:00");
        const fDate = new Date(fromDate + " 00:00:00");
        const tDate = new Date(toDate + " 00:00:00");
  
        // Tính khoảng cách ngày
        const fDaysDiff = (current.getTime() - fDate.getTime()) / (1000 * 3600 * 24);
        const tDaysDiff = (current.getTime() - tDate.getTime()) / (1000 * 3600 * 24);
  
        // Kiểm tra ngày và title (dùng includes để tìm kiếm mềm)
        if (fDaysDiff >= 0 && tDaysDiff <= 0) {
          if (item.label.toLowerCase().includes(title.toLowerCase())) {
            if (item.status === "Completed") {
              completed.push(item);
            } else {
              newTodo.push(item);
            }
          }
        }
      });
  
      if (newTodo.length > 0 || completed.length > 0) {
        this.setState({
          todoItems: newTodo,
          completedTodo: completed
        });
      } else {
        alert("No Search Results.");
      }
    } else {
      this.updateData();
    }
  };
  

  // aFunctionCall = (data: string | null) => {
  //   this.props.changeLogin(data);
  // }

  removeItem = (id: string) => {
    this.state.originalData.forEach(item => {
      if(id.toString().localeCompare(item.id.toString()) === 0) {
        const removeItem = {
          "id": item.id,
          "description": item.description,
          "priority": item.priority, 
          "status": item.status,
          "label": item.label,
          "start_date": item.start_date,
          "start_time": item.start_time,
          "date": item.date,
          "time": item.time
        }

        const accessToken = this.props.authToken;
        
        const requestOptions = {
            method: 'POST',
            headers: { 
                "Content-Type": "application/json",
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(removeItem) 
        };

        fetch(`${import.meta.env.VITE_ENDPOINT_URL}/tasks/deleteTask`, requestOptions)
        .then(response => {
          if(response.status === 201) {
            this.updateData();
          } else {
              alert("There was some problem with that. We're currently working on fixing it. Thank You.");
          }
        });
      }
    });
  }

  render() {
    const dark = {
      background: "#333",
      color: "white"
    };
  
    const light = {
      color: "#555",
      background: "white"
    };
  
    const bgDark = {
      background: "#111",
      color: "white"
    };
  
    const bgLight = {
      background: "#66b3ff",
      color: "#555"
    };
  
    return (
      <div className="belowBody" style={this.props.isDark === true ? bgDark : bgLight}>
        <NavbarAbove 
          toggleModal={this.toggleAddTask}
          searchFunction={this.searchFunction}
          isDark={this.props.isDark}
          // aFunctionCall={this.aFunctionCall}
          authToken={this.props.authToken}
          uname={this.state.username}
        />
  
        <AddTask 
          show={this.state.showAdd}
          onHide={this.toggleAddTask}
          addnewtask={this.addNewTask}
          isDark={this.props.isDark}
          authToken={this.props.authToken}
        />
  
        <div style={this.props.isDark === true ? dark : light} className={this.state.todoItems.length !== 0 ? "todo-table mr-bottom" : "todo-table"}>
          {this.state.todoItems.length !== 0 ? (
            <table style={this.props.isDark === true ? dark : light} className="table table-borderless table-responsive">
              <thead className="thead-light">
                <tr className="head">
                  <th scope="col"></th>
                  <th scope="col"></th>
                  <th onClick={() => this.sortTasks("label", true)} scope="col">
                    <div className="sort-icon">
                      Title
                      {this.getSortIcon("label")}
                    </div>
                  </th>
                  <th onClick={() => this.sortTasks("priority", true)} scope="col">
                    <div className="sort-icon">
                      Priority
                      {this.getSortIcon("priority")}
                    </div>
                  </th>
                  <th onClick={() => this.sortTasks("start_date", true)} scope="col">
                    <div className="sort-icon">
                      Start Date
                      {this.getSortIcon("start_date")}
                    </div>
                  </th>
                  <th onClick={() => this.sortTasks("start_time", true)} scope="col">
                    <div className="sort-icon">
                      Start Time
                      {this.getSortIcon("start_time")}
                    </div>
                  </th>
                  <th onClick={() => this.sortTasks("status", true)} scope="col">
                    <div className="sort-icon">
                      Status
                      {this.getSortIcon("status")}
                    </div>
                  </th>
                  <th scope="col"  className="des-column">Description</th>
                  <th onClick={() => this.sortTasks("date", true)} scope="col">
                    <div className="sort-icon">
                      End Date
                      {this.getSortIcon("date")}
                    </div>
                  </th>
                  <th onClick={() => this.sortTasks("time", true)} scope="col" className="end-time-column">
                    <div className="sort-icon">
                      End Time
                      {this.getSortIcon("time")}
                    </div>
                  </th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {this.state.todoItems.map(item => {
                  return (
                    <Task
                      key={item.key}
                      priority={item.priority}
                      id={item.id}
                      desc={item.description}
                      status={item.status}
                      label={item.label}
                      start_date={item.start_date}
                      start_time={item.start_time}
                      date={item.date}
                      time={item.time}
                      comp={""}
                      isDark={this.props.isDark}
                      completedTask={this.completedTask}
                      removeItem={this.removeItem}
                      authToken={this.props.authToken}
                      updateData={this.updateData}
                    />
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center">
              <Image className="center-image" src={logo} fluid />
              <h6 className="text-center">All done for now or No result.<br />Click on add task or Click reset to keep track of your task .</h6>
            </div>
          )}
        </div>
        <Archive 
          doneItems={this.state.completedTodo}
          removeItem={this.removeItem}
          completedTask={this.completedTask}
          isDark={this.props.isDark}
        />
      </div>
    );
  }
  
}

export default ViewTasks;
