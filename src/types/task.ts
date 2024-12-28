export type Task = {
	dateTimeModified: string;
	dateTimeSet: string;
	dueDateTime: string;
	id: number;
	itemDescription: string;
	itemLabel: string;
	itemPriority: TaskPriority;
	itemStatus: TaskStatus;
	userId: number;
};

export enum TaskPriority {
	High = "High",
	Medium = "Medium",
	Low = "Low",
}
export enum TaskStatus {
	Completed = "Completed",
	Pending = "Pending",
	Overdue = "Overdue",
	NotStarted = "Not Started",
	OnGoing = "OnGoing",
}
