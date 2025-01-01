import useTasks from "../../../hooks/useTasksContext";
import ArchiveList from "../ArchiveList";
import TaskList from "../TaskList";
import Toolbar from "../Toolbar";

const ViewTasks = () => {
  const { getTaskIds } = useTasks();
  const taskIds = getTaskIds(true);

  return (
    <div>
      <Toolbar />
      <TaskList
        taskIds={taskIds}
        emptyCaption={() => (
          <h6 className="text-center">
            All done for now or No result.
            <br />
            Click on add task or Click reset to keep track of your task .
          </h6>
        )}
      />
      <ArchiveList />
    </div>
  );
};

export default ViewTasks;
