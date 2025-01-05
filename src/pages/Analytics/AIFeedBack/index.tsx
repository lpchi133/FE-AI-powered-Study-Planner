import { useQuery } from "@tanstack/react-query";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useAxios from "../../../hooks/useAxios";

type Props = {
  taskIds: number[];
};

const AIFeedBack = ({ taskIds }: Props) => {
  const { get } = useAxios();

  // Fetch AI suggestions with React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ai-suggestion-feed-back", taskIds], // Query key depends on user ID
    queryFn: async () => {
      const response = await get(`/ai-suggestion/feed-back`, { taskIds });
      return response;
    },
  });

  return (
    <div className="flex bg-white shadow p-7 rounded-lg mt-8">
      <div className="min-w-[100%]">
        <div className="py-6 pl-6 pr-3 rounded-lg border-2 border-blue-300  ">
          <div className="text-xl font-bold text-blue-600 mb-2">
            ✨ AI-powered Feedback:
          </div>
          <div>
            <div className="mr-2">
              {isLoading && (
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-5 h-5 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                  <div className="w-5 h-5 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                  <p className="text-gray-500 ml-3">
                    Loading AI suggestions...
                  </p>
                </div>
              )}
              {isError && (
                <div>
                  There was an error fetching the data. Has error:{" "}
                  {error.message}
                </div>
              )}
              <div className="flex flex-col items-start max-h-[500px] overflow-y-auto">
                {data && (
                  <Markdown remarkPlugins={[remarkGfm]}>{data}</Markdown>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFeedBack;
