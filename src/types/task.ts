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
	focusTime: number | null;
	breakTime: number | null;
};

export type FocusSession = {
	id: number;
	taskId: number;
	duration: number;  // Session duration in minutes
	startedAt: string; // ISO string for startedAt
	endedAt: string | null; // ISO string or null for endedAt
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
