import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function AIChatBox() {
  const { user } = useAuth();
  const axiosInstance = useAxios();
  const location = useLocation();
  const [text, setText] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false); // State to control the loading spinner when refresh is triggered

  // Fetch AI suggestions with React Query
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["ai-suggestion", user?.id], // Query key depends on user ID
    queryFn: async () => {
      const response = await axiosInstance.get(`/ai-suggestion`);
      return response.data;
    },
    enabled: !!user?.id, // The query will only run if user ID exists
  });

  // Trigger refetch when the route changes to /ai_chat_box
  useEffect(() => {
    if (location.pathname === "/ai_chat_box" && !!user?.id) {
      refetch(); // Refetch data when the user navigates to this page
    }
  }, [location.pathname, user?.id, refetch]);

  // Update text state when data changes
  useEffect(() => {
    if (data) {
      setText(data); // Set the new data to text state
    }
  }, [data]);

  // Handle the refresh action
  const handleRefresh = async () => {
    if (user?.id) {
      setIsRefreshing(true); // Turn on the loading spinner when refreshing
      await refetch(); // Refetch the data
      setIsRefreshing(false); // Turn off the loading spinner when done
    }
  };

  return (
    <div className="flex flex-col items-center mt-24 h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-3xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold text-blue-600">✨ AI-powered Suggestions</div>
          <button
            onClick={handleRefresh} // Trigger refresh on button click
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition duration-300"
          >
            Refresh 🔄
          </button>
        </div>

        {/* Loading State */}
        {isLoading || isFetching || isRefreshing ? (
          // Show loading spinner if any fetching or refresh state is active
          <div className="flex justify-center items-center space-x-2">
            <div className="w-5 h-5 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-5 h-5 bg-blue-500 rounded-full animate-bounce delay-150"></div>
            <div className="w-5 h-5 bg-blue-500 rounded-full animate-bounce delay-300"></div>
            <p className="text-gray-500 ml-3">Loading AI suggestions...</p>
          </div>
        ) : isError ? (
          // Error State
          <div className="text-red-500 bg-red-100 p-3 rounded-md text-center">
            <p className="font-bold">Error:</p>
            <p>{error?.message || "Something went wrong. Please try again!"}</p>
          </div>
        ) : (
          // Display fetched data
          <div className="bg-gray-100 p-4 rounded-lg shadow-inner whitespace-pre-wrap text-gray-800 leading-relaxed">
            {text || "No suggestions available at the moment."}
          </div>
        )}
      </div>
    </div>
  );
}
