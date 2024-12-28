import EventEmitter from "events";
import { AddTaskModalProps } from "../modals/AddTasks";
import { EditTaskModalProps } from "../modals/EditTasks";
import { DeleteTaskModalProps } from "../modals/DeleteTask";

export type CallbackFunction = (args?: unknown) => void;
export const eventBus = new EventEmitter();

export enum EventKeys {
	addTaskModal = "addTaskModal",
	editTaskModal="editTaskModal",
	deleteTaskModal= "deleteTaskModal"
	
}
// Define the event payload types
export interface EventPayloads {
 [EventKeys.addTaskModal]:  AddTaskModalProps,
 [EventKeys.editTaskModal]:EditTaskModalProps,
 [EventKeys.deleteTaskModal]:DeleteTaskModalProps
}

/**
 * Type-safe event system for managing application-wide events.
 */
const events = {
	/**
	 * Emit an event with a typed payload.
	 * @param eventName - The name of the event to emit.
	 * @param payload - The payload to send with the event.
	 */
	emit: <K extends EventKeys>(
		eventName: K,
		payload: EventPayloads[K],
	): boolean => eventBus.emit(eventName, payload),

	/**
	 * Register an event listener with type-safe payload.
	 * @param eventName - The name of the event to listen for.
	 * @param listener - The callback function to execute when the event is emitted.
	 */
	on: <K extends EventKeys>(
		eventName: K,
		listener: (payload: EventPayloads[K]) => void,
	): EventEmitter => eventBus.on(eventName, listener),

	/**
	 * Remove an event listener.
	 * @param eventName - The name of the event to remove the listener from.
	 * @param listener - The callback function to remove.
	 */
	off: <K extends EventKeys>(
		eventName: K,
		listener: (payload: EventPayloads[K]) => void,
	): EventEmitter => eventBus.off(eventName, listener),

	/**
	 * Open a modal with a typed payload.
	 * @param openModalKey - The event key for opening the modal.
	 * @param payload - The payload to send with the modal open event.
	 */
	openModal: <K extends EventKeys>(
		openModalKey: K,
		payload: EventPayloads[K],
	): boolean => eventBus.emit(openModalKey, payload),
};

export default events;
