import moment from "moment";
import { Col, Form, Modal, Row } from "react-bootstrap";
import { FormProvider, useForm } from "react-hook-form";
import StatusCell from "../../pages/NewTodo/Task/Status";
import useModalControl from "../../hooks/useModalControl";
import { type Task, TaskPriority, TaskStatus } from "../../types/task";
import { EventKeys } from "../../utils/eventBus";
import useAxios from "../../hooks/useAxios";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

export type AddTaskModalProps = {
  id: number;
};

type AddTaskForm = Omit<Task, "id" | "userId">;

const AddTaskModal = () => {
  const { isOpen, close } = useModalControl(EventKeys.addTaskModal);
  const { post } = useAxios();
  const queryClient = useQueryClient();
  const methods = useForm<AddTaskForm>({
    defaultValues: {
      dateTimeSet: moment().format("YYYY-MM-DDTHH:mm"),
      dueDateTime: moment().format("YYYY-MM-DDTHH:mm"),
      itemStatus: TaskStatus.NotStarted,
      itemPriority: TaskPriority.Medium,
    },
  });

  const handleSubmit = (data: AddTaskForm) => {
    post("/tasks/createTask", data)
      .then(() => {
        close();
        methods.reset();
        toast.success("Task added successfully");
        queryClient.refetchQueries({
          queryKey: ["tasks"],
        });
      })
      .catch(() => {
        toast.error("Failed to add task");
      });
  };
  const onClose = () => {
    close();
    methods.reset();
  };
  const onTimelineChange = () => {
    const startDate = moment(methods.watch("dateTimeSet"));
    const dueDate = moment(methods.watch("dueDateTime"));
    const now = moment();
    const daysDiff = dueDate.diff(startDate, "days");

    if (now.isAfter(dueDate)) {
      methods.setValue("itemStatus", TaskStatus.Overdue);
    } else if (now.isBefore(startDate)) {
      methods.setValue("itemStatus", TaskStatus.NotStarted);
    } else if (daysDiff <= 2) {
      methods.setValue("itemStatus", TaskStatus.Pending);
    } else {
      methods.setValue("itemStatus", TaskStatus.OnGoing);
    }
  };
  const itemStatus = methods.watch("itemStatus");

  return (
    <FormProvider {...methods}>
      <Modal show={isOpen} onHide={onClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Add Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={methods.handleSubmit(handleSubmit)} onReset={() => methods.reset()}>
            <Form.Group as={Col}>
              <Form.Group
                as={Col}
                style={{
                  marginBottom: "1rem",
                }}>
                <Form.Label htmlFor="itemLabel">Name</Form.Label>
                <Form.Control
                  {...methods.register("itemLabel", { required: true })}
                  required
                  placeholder="Enter task name"
                />
                <Form.Control.Feedback type="invalid">
                  {methods.getFieldState("itemLabel").error?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                style={{
                  marginBottom: "1rem",
                }}>
                <Form.Label htmlFor="itemDescription">Description</Form.Label>
                <Form.Control {...methods.register("itemDescription")} placeholder="Enter task description" />
                <Form.Control.Feedback type="invalid">
                  {methods.getFieldState("itemDescription").error?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Row}
                style={{
                  marginBottom: "1rem",
                }}>
                <Form.Group as={Col}>
                  <Form.Label htmlFor="dateTimeSet">Start Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    {...methods.register("dateTimeSet", {
                      onChange: () => {
                        onTimelineChange();
                      },
                      validate: (value) => {
                        const endDate = moment(methods.watch("dueDateTime"));
                        const startDate = moment(value);
                        if (startDate.isAfter(endDate)) {
                          return "Start date cannot be after due date";
                        }
                        return true;
                      },
                    })}
                    placeholder="Enter due date"
                    defaultValue={moment().format("YYYY-MM-DDTHH:mm")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {methods.getFieldState("dateTimeSet").error?.message}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label htmlFor="itemDueDate">Due Date</Form.Label>
                  <Form.Control
                    {...methods.register("dueDateTime", {
                      onChange: () => {
                        onTimelineChange();
                      },
                      validate: (value) => {
                        const startDate = moment(methods.watch("dateTimeSet"));
                        const endDate = moment(value);
                        if (endDate.isBefore(startDate)) {
                          return "Due date cannot be before start date";
                        }
                        return true;
                      },
                    })}
                    placeholder="Enter due date"
                    type="datetime-local"
                    defaultValue={moment().format("YYYY-MM-DDTHH:mm")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {methods.getFieldState("dueDateTime").error?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Form.Group>
              <Form.Group
                as={Row}
                style={{
                  marginBottom: "1rem",
                }}>
                <Form.Group as={Col}>
                  <Form.Label htmlFor="dateTimeSet">Priority</Form.Label>
                  <Form.Select {...methods.register("itemPriority")}>
                    <option value={TaskPriority.High}>High</option>
                    <option value={TaskPriority.Medium}>Medium</option>
                    <option value={TaskPriority.Low}>Low</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label htmlFor="itemDueDate">Status</Form.Label>
                  <div>
                    <StatusCell status={itemStatus} />
                  </div>
                </Form.Group>
              </Form.Group>
            </Form.Group>
            <Row>
              <Form.Group className="offset-md-3 col-md-2 mb-3">
                <button className="btn btn-primary btn-lg" type="submit" id="add-btn">
                  Add
                </button>
              </Form.Group>
              <Form.Group className="offset-md-2 col-md-2 mb-3">
                <button className="btn btn-danger btn-lg" type="reset" id="reset-btn">
                  Reset
                </button>
              </Form.Group>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>
    </FormProvider>
  );
};

export default AddTaskModal;
