import { useQuery } from '@tanstack/react-query';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useAxios from '../../../hooks/useAxios';

const AIFeedBack = () => {
    const { get } = useAxios();

    // Fetch AI suggestions with React Query
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["ai-suggestion-feed-back"], // Query key depends on user ID
        queryFn: async () => {
            const response = await get(`/ai-suggestion/feed-back`);
            return response;
        },
    });

    return (
        <div className="flex bg-white shadow p-7 rounded-lg mt-8">
            <div className='min-w-[100%]'>
                <div
                    className=" ml-7 py-6 pl-6 pr-3 rounded-lg border-2 border-blue-300  "
                >
                    <div className="text-xl font-bold text-blue-600 mb-2">
                        ✨ AI-powered Feedback:
                    </div>
                    <div
                        className="flex flex-col items-start max-h-[500px] overflow-y-auto "
                    >
                        <div className="mr-2">
                            {isLoading &&
                                <div className='w-full flex items-center justify-center'>
                                    <div
                                        className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                        role="status">
                                        <span
                                            className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                                        >Loading...</span>
                                    </div>
                                </div>

                            }
                            {isError && <div>There was an error fetching the data. Has error: {error.message}</div>}
                            {data && <Markdown remarkPlugins={[remarkGfm]}>{data}</Markdown>}
                        </div>
                    </div>
                </div>
            </div>

        </div>

    )
}

export default AIFeedBack