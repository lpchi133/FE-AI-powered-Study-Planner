import AddTaskModal from "./AddTasks";
import DeleteTaskModal from "./DeleteTask";
import EditTaskModal from "./EditTasks";

const ModalControl = () => {
	return (
		<>
            <AddTaskModal />
			<EditTaskModal/>
			<DeleteTaskModal />
        </>
	);
};

export default ModalControl;
