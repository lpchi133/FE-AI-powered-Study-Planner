import { Component } from 'react';
import Task from '../Task';
import AddTask from '../AddTask';
import NavbarAbove from '../Navbar';
import Image from 'react-bootstrap/Image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import Archive from '../Archive';
import logo from '/images/preview.png'
import './ViewTask.css';

interface TaskItem {
    id: string;
    // priority: string;
    itemDescription: string;
    itemStatus: string;
    itemLabel: string;
    dueDateTime: string; // Giả sử định dạng là chuỗi; có thể điều chỉnh nếu cần
    authToken: string | null;
  }

interface TaskType {
  key: number;
  id: string;
  // priority: string;
  description: string;
  status: string;
  label: string;
  date: string;
  time: string;
  authToken: string | null;
}

interface TodoState {
  showAdd: boolean;
  todoItems: TaskType[];
  completedTodo: TaskType[];
  originalData: TaskType[];
  sortType: {
    status: 'asc' | 'desc' | '';
    label: 'asc' | 'desc' | '';
    date: 'asc' | 'desc' | '';
    time: 'asc' | 'desc' | '';
  };
  currentSort: 'status' | 'label' | 'date' | 'time';
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
      status: '',
      label: '',
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

    fetch(`${import.meta.env.VITE_ENDPOINT_URL}/users/tasks`, requestOptions)
    .then(response => response.json())
    .then(data => {
        
        console.log("Received data:", data); // In ra dữ liệu nhận được

        const OGdata: TaskType[] = [];
        let keyId = 1;

        data.forEach((item: TaskItem) => {
          if (item.dueDateTime && item.itemDescription && item.itemStatus && item.itemLabel) {
            const newData: TaskType = {
              key: keyId, 
              id: item.id,
              // priority: item.priority,
              description: item.itemDescription,
              status: item.itemStatus,
              label: item.itemLabel,
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
            const dueDate = new Date(item.date + " " + item.time);
            const daysDiff = (dueDate.getTime() - nowDate) / (1000 * 3600 * 24);

            if(item.status !== 'Completed') {
              if(daysDiff < 0) {
                item.status = "Overdue";
              } else if(daysDiff <= 2) {
                item.status = "Pending";
              } else {
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
        item.time = time;

        const updateItem = {
          "id": item.id,
          "description": item.description,
          "status": item.status,
          "label": item.label,
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
            body: JSON.stringify(updateItem) 
        };

        fetch(`${import.meta.env.VITE_ENDPOINT_URL}/users/updateTask`, requestOptions)
        .then(response => {
          if(response.status !== 201) {
              alert("There was some problem with that. We're currently working on fixing it. Thank You.");
          }
        });
      }
    });

    setTimeout(() => {
      this.updateData();
    }, 100);
  }

  searchFunction = (fromDate: string, toDate: string, val: number = 1) => {
    if(val === 1) {
      const newTodo: TaskType[] = [];
      const completed: TaskType[] = [];

      this.state.originalData.forEach(item => {
        const current = new Date(item.date + " 00:00:00");
        const fDate = new Date(fromDate + " 00:00:00");
        const tDate = new Date(toDate + " 00:00:00");

        const fDaysDiff = (current.getTime() - fDate.getTime()) / (1000 * 3600 * 24);
        const tDaysDiff = (current.getTime() - tDate.getTime()) / (1000 * 3600 * 24);
        
        if(fDaysDiff >= 0 && tDaysDiff <= 0) {
          if(item.status === "Completed") {
            completed.push(item);
          } else {
            newTodo.push(item);
          }
        }
      });

      if(newTodo.length !== 0) {
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
  }

  // aFunctionCall = (data: string | null) => {
  //   this.props.changeLogin(data);
  // }

  removeItem = (id: string) => {
    this.state.originalData.forEach(item => {
      if(id.toString().localeCompare(item.id.toString()) === 0) {
        const removeItem = {
          "id": item.id,
          "description": item.description,
          "status": item.status,
          "label": item.label,
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

        fetch(`${import.meta.env.VITE_ENDPOINT_URL}/users/deleteTask`, requestOptions)
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
      background: "#93c5fd",
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
                  <th scope="col">Title</th>
                  <th onClick={() => this.sortTasks("status", true)} scope="col">
                    <div className="sort-icon">
                      Status
                      {this.getSortIcon("status")}
                    </div>
                  </th>
                  <th onClick={() => this.sortTasks("label", true)} scope="col">
                    <div className="sort-icon">
                      Label
                      {this.getSortIcon("label")}
                    </div>
                  </th>
                  <th onClick={() => this.sortTasks("date", true)} scope="col">
                    <div className="sort-icon">
                      Date
                      {this.getSortIcon("date")}
                    </div>
                  </th>
                  <th onClick={() => this.sortTasks("time", true)} scope="col">
                    <div className="sort-icon">
                      Time
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
                      // priority={item.priority}
                      id={item.id}
                      desc={item.description}
                      status={item.status}
                      label={item.label}
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
              <h6 className="text-center">All done for now.<br />Click on add task to keep track of your tasks.</h6>
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
