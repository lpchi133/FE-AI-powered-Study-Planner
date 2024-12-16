import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./components/Home";
import Login from "./components/Login";
import Profile from "./components/Profile";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import GoogleUser from "./components/GoogleUser";
import AIChatBox from "./components/AIChatBox";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/google/user/:token" element={<GoogleUser />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="/ai_chat_box" element={<AIChatBox />} />

            <Route path="/register" element={<Register />} />
          </Routes>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
