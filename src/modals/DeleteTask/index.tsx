import { useQueryClient } from "@tanstack/react-query";
import { Col, Modal, Row } from "react-bootstrap";
import useAxios from "../../hooks/useAxios";
import useModalControl from "../../hooks/useModalControl";
import { type Task } from "../../types/task";
import { EventKeys } from "../../utils/eventBus";
import { toast } from "react-toastify";

export type DeleteTaskModalProps = {
    task:Task
};


const DeleteTaskModal = () => {
    const {post } =useAxios();
  const queryClient = useQueryClient();
  const { isOpen, close,payload} = useModalControl(EventKeys.deleteTaskModal,{
    onOpen(payload) {
      console.log("open")
      const task=payload?.task
      console.log("task",task)
      if(!task) {
        close();
        return;
      }
    },
  });


  const onClose = () => {
    close();
  };

  const onConfirm =()=>{
    console.log("delete ")
    post("/tasks/deleteTask",{
        id:payload?.task.id
    }).then(()=>{
          toast.success("Task delete successfully");
 queryClient.refetchQueries({
        queryKey:['tasks']
    }).catch(()=>{
        toast.error("Task delete successfully")
    }).finally(()=>{
      onCancel();
    })

    })
   
  }

  const onCancel=()=>{
    onClose();
  }

  return (
      <Modal show={isOpen} onHide={onClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Delete Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Row>
            Are you sure to delete task {payload?.task.itemLabel}?

            </Row>
              <Col>
                <button className="btn btn-secondary btn-lg" type="reset" id="reset-btn" onClick={onCancel}>
                  Cancel
                </button>
                 <button className="btn btn-danger btn-lg" type="submit" id="add-btn" onClick={onConfirm}>
                  Delete
                </button>
            </Col>
            
        </Modal.Body>
      </Modal>
  );
};

export default DeleteTaskModal;
