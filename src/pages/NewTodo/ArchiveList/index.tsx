import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Accordion, Card } from 'react-bootstrap';
import useTasks from '../../../hooks/useTasksContext';
import TaskList from '../TaskList';
import "./index.css";

const ArchiveList = () => {
    const { getCompleteTaskIds } = useTasks();

    const [isOpen, setIsOpen] = useState(true);

    const toggleAccordion = () => { setIsOpen((prev) => !prev) }
    const completeTaskIds = getCompleteTaskIds();

    // console.log("Complete Task IDs:", completeTaskIds);
    return (
        <Accordion

            activeKey={isOpen ? null : "0"} // Điều khiển trạng thái của Accordion qua activeKey
        >
            <Card>
                <Card.Header>
                    <div className='flex rounded-[1rem]' onClick={toggleAccordion}>
                        <h2>Archive</h2>
                        <FontAwesomeIcon icon={isOpen ? faAngleDown : faAngleUp} />

                    </div>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                    <Card.Body>
                        <TaskList
                            taskIds={completeTaskIds}
                            isArchive={true}
                            emptyCaption={() => (
                                <h6 className="text-center no-tasks-message">
                                    Complete tasks to see them here.
                                </h6>
                            )}
                        />
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        </Accordion>
    )
}

export default ArchiveList