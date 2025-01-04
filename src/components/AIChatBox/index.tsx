import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";
export default function AIChatBox() {
  const { user } = useAuth();
  const { get } = useAxios();
  const [isRefreshing, setIsRefreshing] = useState(false); // State to control the loading spinner when refresh is triggered

  // Fetch AI suggestions with React Query
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["ai-suggestion"], // Query key depends on user ID
    queryFn: async () => {
      const response = await get(`/ai-suggestion`);
      return response;
    },
    enabled: false, // Do not automatically fetch when the component is mounted
  });

  // Handle the refresh action
  const handleRefresh = async () => {
    if (user?.id) {
      setIsRefreshing(true); // Turn on the loading spinner when refreshing
      await refetch(); // Refetch the data
      setIsRefreshing(false); // Turn off the loading spinner when done
    }
  };

  // Handle page reload (triggered by browser reload or manual reload)
  useEffect(() => {
    if (user?.id) {
      refetch(); // Fetch the data when the component mounts (if the user exists)
    }
  }, [user?.id, refetch]);

  return (
    <div className="flex flex-col items-center pt-24 min-h-screen bg-blue-300">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-3xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold text-blue-600">
            ✨ AI-powered Suggestions
          </div>
          <button
            onClick={handleRefresh} // Trigger refresh on button click
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition duration-300"
          >
            Refresh <FontAwesomeIcon icon={faRotate} />
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
          <Markdown remarkPlugins={[remarkGfm]}>{data}</Markdown>
        )}
      </div>
    </div>
  );
}
