import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import TaskList from "../TaskList";
// import AISuggestions from "../AISuggestions";
import DnDCalendar from "../DnDCalendar";
import { useState } from "react";

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  estimatedTime: string;
  status: string;
}

const Home = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete math homework', description: 'Solve all exercises in the math book.', priority: 'High', estimatedTime: '2 hours', status: 'Todo' },
    { id: 2, title: 'Read chapter 4 of history book', description: 'Read and summarize the chapter.', priority: 'Medium', estimatedTime: '1 hour', status: 'Todo' },
    { id: 3, title: 'Write an essay on climate change', description: 'Write an essay for the school project.', priority: 'High', estimatedTime: '3 hours', status: 'Todo' },
  ]);

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((prevTasks) => 
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-6">Welcome to AI-Powered Study Planner</h1>
          {user && (
            <p className="text-lg text-gray-600 mb-8">
              Hello, <span className="font-semibold">{user.name}</span>! Let’s plan your tasks effectively.
            </p>
          )}
        </div>
      {!user ? (
        <div className="space-x-4">
          <Link to="/login">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="bg-green-500 text-white px-4 py-2 rounded">
              Register
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Task List</h2>
              <TaskList
                tasks={tasks}
                onDragStart={(task) => console.log("Task being dragged:", task)}
              />
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Drag and Drop Calendar</h2>
              <DnDCalendar tasks={tasks} onTaskUpdate={handleTaskUpdate} />
            </div>
          </div>
      )}
    </div>
    </div>
  );
};

export default Home;
