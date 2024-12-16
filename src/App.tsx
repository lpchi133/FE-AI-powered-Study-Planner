import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./components/Login";
import Profile from "./components/Profile";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import Header from "./components/Header";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import GoogleUser from "./components/GoogleUser";
import "react-toastify/dist/ReactToastify.css";
import { Suspense, lazy } from 'react';
import DnDCalendar from "./components/DnDCalendar";


const queryClient = new QueryClient();
const ViewTasksWrapper = lazy(() => import('./components/Todo/ViewTasksWrapper'));

function App() {
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
              <Route path="/" element={<ViewTasksWrapper isDark={false} />} /> 
              <Route path="/calendar" element={<DnDCalendar/>} />
            </Route>

            <Route path="/register" element={<Register />} />
          </Routes>
          </Suspense>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
