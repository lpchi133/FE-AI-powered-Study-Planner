import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import useAxios from "../../hooks/useAxios";

const ActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { get } = useAxios();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      activateAccount(token);
    } else {
      setError("Invalid activation link.");
      setLoading(false);
    }
  }, [searchParams]);

  const activateAccount = async (token: string) => {
    try {
      await get(`/auth/activate?token=${token}`);
      toast.success("Account activated successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Activation error:", error); // Log the error for debugging
      setError("Failed to activate account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-16">
      <div className="w-full max-w-md bg-white p-6 shadow-lg rounded-lg text-center">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div>Account activated successfully! Redirecting to login...</div>
        )}
      </div>
    </div>
  );
};

export default ActivateAccount;