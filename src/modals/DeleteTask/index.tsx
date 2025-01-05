import { useQueryClient } from "@tanstack/react-query";
import { Col, Modal, Row, Button } from "react-bootstrap";
import useAxios from "../../hooks/useAxios";
import useModalControl from "../../hooks/useModalControl";
import { type Task } from "../../types/task";
import { EventKeys } from "../../utils/eventBus";
import { toast } from "react-toastify";

export type DeleteTaskModalProps = {
  task: Task;
};

const DeleteTaskModal = () => {
  const { post } = useAxios();
  const queryClient = useQueryClient();
  const { isOpen, close, payload } = useModalControl(
    EventKeys.deleteTaskModal,
    {
      onOpen(payload) {
        const task = payload?.task;
        if (!task) {
          close();
          return;
        }
      },
    }
  );

  const onClose = () => {
    close();
  };

  const onConfirm = () => {
    post("/tasks/deleteTask", {
      id: payload?.task.id,
    }).then(() => {
      toast.success("Task deleted successfully");
      queryClient
        .refetchQueries({
          queryKey: ["tasks"],
        })
        .catch(() => {
          toast.error("Failed to delete task");
        })
        .finally(() => {
          onCancel();
        });
    });
  };

  const onCancel = () => {
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Delete Task
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            Are you sure you want to delete the task "{payload?.task.itemLabel}
            "?
          </Col>
        </Row>
        <Row className="mt-3">
          <Col className="d-flex justify-content-between">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              Delete
            </Button>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteTaskModal;
