import { useAbly } from "../../../hooks/useAbly";
import useTasks from "../../../hooks/useTasksContext";
import ArchiveList from "../ArchiveList";
import TaskList from "../TaskList";
import Toolbar from "../Toolbar";

const ViewTasks = () => {
  const { getTaskIds } = useTasks();
  const taskIds = getTaskIds(true);

  useAbly();

  return (
    <div className="bg-blue-300 pt-1 pb-0 mb-0 min-h-screen overflow-hidden">
      <Toolbar />
      <div className="flex flex-col items-center mb-0">
        <h1 className="text-3xl font-bold mt-2 mb-0">Task List</h1>
        <TaskList
          taskIds={taskIds}
          emptyCaption={() => (
            <h6 className="text-center">
              All done for now or No result.
              <br />
              Click on add task or Click reset to keep track of your task.
            </h6>
          )}
        />
      </div>
      <ArchiveList />
    </div>
  );
};

export default ViewTasks;
