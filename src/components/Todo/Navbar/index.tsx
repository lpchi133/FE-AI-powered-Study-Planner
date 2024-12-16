import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
// import NavDropdown from 'react-bootstrap/NavDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

interface NavbarAboveProps {
  isDark: boolean;
  uname: string;
  authToken: string | null;
  searchFunction: (title: string, fromDate: string, toDate: string, reset?: number) => void;
  toggleModal: () => void;
}

interface NavbarAboveState {
  title: string;
  fromDate: string;
  toDate: string;
  validated: boolean;
}

class NavbarAbove extends React.Component<NavbarAboveProps, NavbarAboveState> {

  constructor(props: NavbarAboveProps) {
    super(props);
    this.state = {
      title: "",
      fromDate: "",
      toDate: "",
      validated: false
    }
  }

  setValidated = (val: boolean) => {
    this.setState({
      validated: val
    })
  }

  handleSubmit = (event: React.FormEvent) => {
    const form = event.currentTarget as HTMLFormElement;
    event.preventDefault();

    const fDate = new Date(this.state.fromDate + " 00:00:00");
    const tDate = new Date(this.state.toDate + " 00:00:00");

    const daysDiff = (tDate.getTime() - fDate.getTime()) / (1000 * 3600 * 24);

    if (form.checkValidity() === false || (daysDiff < 0 || Number.isNaN(daysDiff))) {

      event.stopPropagation();

      if (daysDiff < 0) {
        this.setValidated(false);
        alert("Select The Dates Properly.");
      } else {
        this.setValidated(true);
      }

    } else {
      this.props.searchFunction(this.state.title, this.state.fromDate, this.state.toDate);
      this.setValidated(false);
    }
  }

  handleReset = () => {
    this.setState({
      title: "",
      fromDate: "",
      toDate: ""
    });
  
    this.setValidated(false);
    this.props.searchFunction(this.state.title, this.state.fromDate, this.state.toDate, 0);
  }
  

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
  
    // Đảm bảo chỉ cập nhật các thuộc tính hợp lệ của NavbarAboveState
    this.setState((prevState: NavbarAboveState) => ({
      ...prevState,
      [name]: value,
    }));
  }
  

  // logoutCall = () => {
  //   const token = ("Token " + this.props.authToken).toString();

  //   const requestOptions: RequestInit = {
  //     method: 'POST',
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Authorization": token,
  //     }
  //   };

  //   fetch('http://127.0.0.1:8000/user/logout/', requestOptions)
  //     .then(response => {
  //       if (response.status === 200) {
  //         this.props.aFunctionCall(null);
  //       } else {
  //         alert("Sorry for the inconvenience. We're working to solve this issue.")
  //       }
  //     });
  // }

  toggleModal = () => {
    this.props.toggleModal();
  }

  render() {
    const bgDark = {
      background: "#111",
      color: "white"
    }

    const bgLight = {
      background: "#93c5fd",
      color: "#555"
    }


    return (
      <div style={this.props.isDark ? bgDark : bgLight}>
        <Navbar collapseOnSelect bg={this.props.isDark ? "dark" : "light"} variant="dark" className="fixedTop-2 mx-auto">
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="nav-2 mx-auto">
              <Form
                noValidate
                validated={this.state.validated}
                onSubmit={this.handleSubmit}
                onReset={this.handleReset}
                className="row"
              >
                {/* Nút Add Task */}
                <Form.Group as={Col} lg="2" controlId="validationAddTask">
                  <Button className="addtask-btn btn-block" variant="warning" onClick={this.toggleModal}>
                    + Add Task
                  </Button>
                </Form.Group>

                {/* Ô Search Tasks */}
                <Form.Group as={Col} lg="4" controlId="validationSearchTasks">
                  <InputGroup>
                    <InputGroup.Text id="inputGroupSearchTasks">Search</InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search tasks..."
                      name="title"
                      value={this.state.title}
                      onChange={this.handleInputChange}
                      aria-describedby="inputGroupSearchTasks"
                      style={this.props.isDark ? bgDark : undefined}
                    />
                  </InputGroup>
                </Form.Group>

                {/* From Date */}
                <Form.Group as={Col} lg="2" controlId="validationFromDate">
                  <InputGroup>
                    <InputGroup.Text id="inputGroupPrepend1">From</InputGroup.Text>
                    <Form.Control
                      type="date"
                      name="fromDate"
                      value={this.state.fromDate}
                      onChange={this.handleInputChange}
                      aria-describedby="inputGroupPrepend1"
                      style={this.props.isDark ? bgDark : undefined}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please choose a proper date.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                {/* To Date */}
                <Form.Group as={Col} lg="2" controlId="validationToDate">
                  <InputGroup>
                    <InputGroup.Text id="inputGroupPrepend2">To</InputGroup.Text>
                    <Form.Control
                      type="date"
                      name="toDate"
                      value={this.state.toDate}
                      onChange={this.handleInputChange}
                      aria-describedby="inputGroupPrepend2"
                      style={this.props.isDark ? bgDark : undefined}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please choose a proper date.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                {/* Nút Submit */}
                <Form.Group as={Col} lg="1" controlId="validationSubmit">
                  <Button className="search-btn btn-block" variant="primary" type="submit">
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                </Form.Group>

                {/* Nút Reset */}
                <Form.Group as={Col} lg="1" controlId="validationReset">
                  <Button className="search-btn btn-block" variant="danger" type="reset">
                    <FontAwesomeIcon icon={faRedoAlt} />
                  </Button>
                </Form.Group>
              </Form>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }
}

export default NavbarAbove;
