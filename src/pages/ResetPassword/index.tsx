import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import useAxios from "../../hooks/useAxios";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { put } = useAxios();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  interface ResetPasswordData {
    newPassword: string;
    token: string;
  }

  const mutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      setLoading(true);
      const response = await put("/auth/reset-password", data);
      return response;
    },
    onSuccess: () => {
      toast.success("Password reset successful!");
      setSuccess(true);
      setError(null);
      navigate("/");
    },
    onError: (error: { response: { data: { message: string } } }) => {
      setError(
        error.response.data.message ||
          error.response.data.message[0] ||
          "Something went wrong. Failed to send email."
      );
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!token) {
      setError("Invalid or missing token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    mutation.mutate({ newPassword: password, token });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Reset Your Password</h2>
        {success && (
          <p className="text-green-500 text-sm mb-4">
            Password reset successful! Redirecting to homepage...
          </p>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
