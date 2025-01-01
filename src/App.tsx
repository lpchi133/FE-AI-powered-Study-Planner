import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AIChatBox from "./components/AIChatBox";
import DnDCalendar from "./pages/Calendar";
import GoogleUser from "./components/GoogleUser";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./components/Register";
import { AuthProvider } from "./context/AuthContext";
import ModalControl from "./modals";
import Todo from "./pages/NewTodo";
import Profile from "./pages/Profile";
import Header from "./components/Header";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Header />
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/google/user/:token" element={<GoogleUser />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/" element={<Todo />} />
                <Route path="/calendar" element={<DnDCalendar />} />
                <Route path="/ai_chat_box" element={<AIChatBox />} />
              </Route>

              <Route path="/register" element={<Register />} />
            </Routes>
            <ModalControl />
          </Suspense>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
