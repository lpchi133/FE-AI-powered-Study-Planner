import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAxios from "../../hooks/useAxios";

interface LoginData {
  email: string;
  password: string;
}

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>();
  const { login, user } = useAuth(); // Add `user` from useAuth
  const { post } = useAxios();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [emailForReset, setEmailForReset] = useState("");

  // Check if the user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/"); // Redirect to the home page if logged in
    }
  }, [user, navigate]);

  const mutation = useMutation({
    mutationFn: async (data: LoginData) => {
      setLoading(true);
      const response = await post("/auth/login", data);
      return response;
    },
    onSuccess: (data) => {
      login(data.accessToken);
      navigate("/");
      toast.success("Login successful!");
    },
    onError: (error: { response: { data: { message: string } } }) => {
      setLoginError(
        error.response.data.message || "Invalid email or password."
      );
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      setLoading(true);
      const response = await post("/auth/forgot-password", { email });
      return response;
    },
    onSuccess: () => {
      toast.success("Password reset email sent! Check your inbox.");
      setIsForgotPassword(false);
    },
    onError: (error: { response: { data: { message: string } } }) => {
      setForgotPasswordError(
        error.response.data.message ||
          error.response.data.message[0] ||
          "Something went wrong. Failed to send email."
      );
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleForgotPassword = () => {
    if (!emailForReset) {
      setForgotPasswordError("Please enter your email.");
      return;
    }
    setForgotPasswordError("");
    forgotPasswordMutation.mutate(emailForReset);
  };

  const onSubmit = (data: LoginData) => {
    setLoginError("");
    mutation.mutate(data);
  };

  const goToGoogle = async () => {
    window.location.replace(`${import.meta.env.VITE_ENDPOINT_URL}/auth/google`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-16">
      <div className="w-full max-w-md bg-white p-6 shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {isForgotPassword ? "Forgot Password" : "Login"}
        </h2>

        {isForgotPassword ? (
          <div>
            <label className="block text-gray-700 text-sm mb-2">
              Enter your email to reset password
            </label>
            <input
              type="email"
              value={emailForReset}
              onChange={(e) => setEmailForReset(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter your email"
            />
            <p className="text-red-500 text-xs mt-1">{forgotPasswordError}</p>
            <button
              onClick={handleForgotPassword}
              className={`w-full mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              onClick={() => {
                setIsForgotPassword(false);
                setLoading(false);
              }}
              className="mt-4 text-blue-600 hover:underline text-sm"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm">Email</label>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm">Password</label>
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            {loginError && (
              <p className="text-red-500 text-xs mb-4">{loginError}</p>
            )}
            <button
              type="submit"
              className={`w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          {!isForgotPassword && (
            <>
              <p className="text-sm text-gray-600">
                <button
                  onClick={() => setIsForgotPassword(true)}
                  className="text-blue-600 hover:underline"
                >
                  Forgot your password?
                </button>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Register here
                </Link>
              </p>
              <div className="mt-6 border-b text-center">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                  Or sign up with Google Account
                </div>
              </div>

              <button
                onClick={goToGoogle}
                className="bg-white border py-2 w-full rounded-xl mt-6 flex justify-center items-center text-sm hover:scale-105 duration-300 hover:bg-[#60a8bc4f] font-medium"
              >
                <svg
                  className="mr-3 mt-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="25px"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  ></path>
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  ></path>
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                </svg>
                Login with Google
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
