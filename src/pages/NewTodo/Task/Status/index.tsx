import { TaskStatus } from "../../../../types/task";

const stylesByStatus = {
	[TaskStatus.Completed]: "bg-green-500 text-white",
	[TaskStatus.Pending]: "bg-yellow-500 text-white",
	[TaskStatus.Overdue]: "bg-red-500 text-white",
	[TaskStatus.NotStarted]: "bg-gray-500 text-white",
	[TaskStatus.OnGoing]: "bg-blue-500 text-white",
};

type Props = {
	status: TaskStatus;
};

const StatusCell = ({ status }: Props) => {
	return <div className={`px-2 ${stylesByStatus[status]} text-sm`}>{status}</div>;
};

export default StatusCell;
