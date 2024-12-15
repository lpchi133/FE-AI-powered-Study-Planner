import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop, { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

const DragAndDropCalendar = withDragAndDrop<Task>(Calendar);

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  estimatedTime: string;
  status: string;
  start?: Date;
  end?: Date;
}

interface DnDCalendarProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

const priorityColors: Record<string, string> = {
  High: '#ef4444',
  Medium: '#eab308',
  Low: '#22c55e',
};

const DnDCalendar: React.FC<DnDCalendarProps> = ({ tasks, onTaskUpdate }) => {
  const [calendarEvents, setCalendarEvents] = useState<Task[]>(tasks);

  const handleEventDrop = (args: EventInteractionArgs<Task>) => {
    const updatedTask = {
      ...args.event,
      start: new Date(args.start),
      end: new Date(args.end),
    };

    if (new Date(args.end) < new Date()) {
      console.log(args.end + ' < ' + new Date());
      updatedTask.status = 'Expired';
    } else updatedTask.status = 'Todo';

    setCalendarEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === updatedTask.id ? updatedTask : event))
    );

    onTaskUpdate(updatedTask);
  };

  const handleEventResize = (args: EventInteractionArgs<Task>) => {
    const updatedTask = {
      ...args.event,
      start: new Date(args.start),
      end: new Date(args.end),
    };

    if (new Date(args.start) < new Date()) {
      updatedTask.status = 'Expired';
    }

    setCalendarEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === updatedTask.id ? updatedTask : event))
    );

    onTaskUpdate(updatedTask);
  };

  const localizer = momentLocalizer(moment);

  const eventStyleGetter = (event: Task) => {
    const priorityColor = priorityColors[event.priority] || 'bg-gray-300';
    return {
      style: {
        backgroundColor: priorityColor,
        color: 'white',
        borderRadius: '5px',
        padding: '0px 5px',
        border: 'none',
      },
    };
  };

  return (
    <div className="p-4 bg-gray-50">
      <h2 className="text-xl font-bold mb-4 text-center">Drag-and-Drop Calendar</h2>
      <DndProvider backend={HTML5Backend}>
        <DragAndDropCalendar
          localizer={localizer}
          events={calendarEvents.map((task) => ({
            ...task,
            start: task.start || new Date(),
            end: task.end || new Date(),
          }))}
          startAccessor={(event) => event.start || new Date()}
          endAccessor={(event) => event.end || new Date()}
          style={{ height: 500 }}
          onEventDrop={handleEventDrop}
          resizable
          onEventResize={handleEventResize}
          eventPropGetter={eventStyleGetter}
        />
      </DndProvider>
      <div className="mt-4">
        <h3 className="font-semibold">Legend:</h3>
        <ul className="flex gap-4 mt-2">
          <li className="flex items-center">
            <span className="inline-block w-4 h-4 bg-red-500 mr-2 rounded"></span> High Priority
          </li>
          <li className="flex items-center">
            <span className="inline-block w-4 h-4 bg-yellow-500 mr-2 rounded"></span> Medium Priority
          </li>
          <li className="flex items-center">
            <span className="inline-block w-4 h-4 bg-green-500 mr-2 rounded"></span> Low Priority
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DnDCalendar;
