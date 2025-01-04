import { Button, Form, InputGroup, Nav, Navbar } from "react-bootstrap";
import events, { EventKeys } from "../../../utils/eventBus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedoAlt, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import "./index.css";
import { useQueryClient } from "@tanstack/react-query";
import useTasks, { SearchState } from "../../../hooks/useTasksContext";

const Toolbar = () => {
  const { setSearch, resetSearch } = useTasks();
  const queryClient = useQueryClient();

  const methods = useForm<SearchState>({
    defaultValues: {
      title: "",
      fromDate: null,
      toDate: null,
    },
  });

  const onRefresh = () => {
    console.log("Invalidating tasks cache...");
    queryClient.invalidateQueries({
      queryKey: ["tasks"],
    });
    resetSearch(); // Đặt lại trạng thái tìm kiếm
    methods.reset();
  };

  const handleSubmit = (data: SearchState) => {
    console.log(data);
    setSearch(data);
  };

  return (
    <div>
      <Navbar collapseOnSelect variant="dark" className="fixedTop-1 mx-auto">
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="nav-2 mx-auto w-100">
            <Form className="d-flex flex-wrap justify-content-center w-100" onSubmit={methods.handleSubmit(handleSubmit)}>
              <Form.Group className="d-flex align-items-center mx-2 my-2" style={{ width: "170px" }} controlId="validationAddTask">
                <Button
                  className="addtask-btn btn-block w-100"
                  variant="primary"
                  onClick={() =>
                    events.openModal(EventKeys.addTaskModal, {
                      id: 1,
                    })
                  }
                >
                  + Add Task
                </Button>
              </Form.Group>

              {/* Ô Search Tasks */}
              <Form.Group className="d-flex align-items-center mx-2 my-2" style={{ width: "360px" }} controlId="validationSearchTasks">
                <InputGroup>
                  <InputGroup.Text id="inputGroupSearchTasks">
                    Search
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search tasks..."
                    {...methods.register("title")}
                  />
                </InputGroup>
              </Form.Group>

              {/* From Date */}
              <Form.Group className="d-flex align-items-center mx-2 my-2" style={{ width: "280px" }} controlId="validationFromDate">
                <InputGroup>
                  <InputGroup.Text id="inputGroupPrepend1">
                    From
                  </InputGroup.Text>
                  <Form.Control
                    type="datetime-local"
                    {...methods.register("fromDate")}
                    aria-describedby="inputGroupPrepend1"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please choose a proper date.
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              {/* To Date */}
              <Form.Group className="d-flex align-items-center mx-2 my-2" style={{ width: "260px" }} controlId="validationToDate">
                <InputGroup>
                  <InputGroup.Text id="inputGroupPrepend2">To</InputGroup.Text>
                  <Form.Control
                    type="datetime-local"
                    {...methods.register("toDate")}
                    aria-describedby="inputGroupPrepend2"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please choose a proper date.
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              {/* Nút Submit */}
              <Form.Group className="d-flex align-items-center mx-2 my-2" style={{ width: "90px" }} controlId="validationSubmit">
                <Button
                  className="search-btn btn-block w-100"
                  variant="primary"
                  type="submit"
                >
                  <FontAwesomeIcon icon={faSearch} />
                </Button>
              </Form.Group>

              {/* Nút Reset */}
              <Form.Group className="d-flex align-items-center mx-2 my-2" style={{ width: "90px" }} controlId="validationReset">
                <Button
                  className="search-btn btn-block w-100"
                  variant="danger"
                  type="reset"
                  onClick={onRefresh}
                >
                  <FontAwesomeIcon icon={faRedoAlt} />
                </Button>
              </Form.Group>
            </Form>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
};

export default Toolbar;