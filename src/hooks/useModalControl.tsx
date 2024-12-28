import { useCallback, useEffect, useState } from "react";
import type { EventKeys, EventPayloads } from "../utils/eventBus";
import events from "../utils/eventBus";

export interface ModalControlType<T> {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	open: (payload?: T) => void;
	close: (payload?: T) => void;
	eventKey: EventKeys;
	payload: T | undefined;
}

export default function useModalControl<K extends EventKeys>(
	eventKey: K,
	options?: {
		onOpen?: (payload: EventPayloads[K] | undefined) => void;
		onClose?: (payload: EventPayloads[K] | undefined) => void;
	},
): ModalControlType<EventPayloads[K]> {
	const [isOpen, setIsOpen] = useState(false);
	const [payload, setPayload] = useState<EventPayloads[K] | undefined>(
		undefined,
	);

	const open = useCallback(
		(payload: EventPayloads[K] | undefined) => {
			setIsOpen(true);
			options?.onOpen?.(payload);
		},
		[options],
	);

	const close = useCallback(
		(payload: EventPayloads[K] | undefined) => {
			setIsOpen(false);
			setPayload(undefined);
			options?.onClose?.(payload);
		},
		[options],
	);

	useEffect(() => {
		const handleEvent = (eventPayload: EventPayloads[K] | undefined) => {
			setPayload(eventPayload);
			open(eventPayload);
		};

		events.on(eventKey, handleEvent);

		return () => {
			events.off(eventKey, handleEvent);
		};
	}, [eventKey, open]);

	return {
		isOpen,
		setIsOpen,
		open,
		close,
		eventKey,
		payload,
	};
}
