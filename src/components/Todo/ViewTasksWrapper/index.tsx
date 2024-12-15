import { useEffect } from 'react';
import {useAuth} from "../../../hooks/useAuth"; 
import ViewTasks from '../ViewTasks';

interface ViewTasksWrapperProps {
  isDark: boolean;
}

const ViewTasksWrapper: React.FC<ViewTasksWrapperProps> = (props) => {
  const { accessToken } = useAuth();

  // Dùng useEffect để import Bootstrap CSS khi component này được render
  useEffect(() => {
    // Dynamically import Bootstrap CSS
    import("bootstrap/dist/css/bootstrap.min.css");
  }, []);

  return <ViewTasks {...props} authToken={accessToken} isDark={false} />;
};

export default ViewTasksWrapper;
