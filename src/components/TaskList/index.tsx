import React from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  estimatedTime: string;
  status: string;
}

const TaskList: React.FC<{ tasks: Task[], onDragStart: (task: Task) => void }> = ({ tasks, onDragStart }) => {
  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search tasks..."
        className="mb-4 p-2 border rounded"
      />
      <ul className="list-disc">
        {tasks.map(task => (
          <li key={task.id} className="mb-2" draggable onDragStart={() => onDragStart(task)}>
            <div className="p-2 border rounded bg-white shadow-sm">
              <strong>{task.title}</strong>
              <p>{task.description}</p>
              <p>Priority: {task.priority}</p>
              <p>Estimated time: {task.estimatedTime}</p>
              <p>Status: {task.status}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
