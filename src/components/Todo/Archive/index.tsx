import React from 'react';
import './Archive.css';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Task from '../Task';

// Định nghĩa kiểu dữ liệu cho props của các component CustomToggle
interface CustomToggleProps {
    onClick: () => void;
}

function CustomToggle1({ onClick }: CustomToggleProps) {
    return (
        <FontAwesomeIcon icon={faAngleDown} onClick={onClick} />
    );
}

function CustomToggle2({ onClick }: CustomToggleProps) {
    return (
        <FontAwesomeIcon icon={faAngleUp} onClick={onClick} />
    );
}

// Định nghĩa kiểu dữ liệu cho props và state của component Archive
interface ArchiveProps {
    isDark: boolean;
    doneItems: Array<{
        key: number;
        id: string;
        description: string;
        priority: string;
        status: string;
        label: string;
        date: string;
        // start_date: string;
        time: string;
        authToken: string | null;
    }> ;
    completedTask: (id: string, date: string, time: string) => void;
    removeItem: (id: string ) => void;
}

interface ArchiveState {
    activeKey: string | null; // Dùng activeKey để điều khiển trạng thái mở/đóng của Accordion
}

class Archive extends React.Component<ArchiveProps, ArchiveState> {

    constructor(props: ArchiveProps) {
        super(props);
        this.state = {
            activeKey: null // Khi bắt đầu Accordion bị đóng
        };
    }

    // Hàm toggle khi click vào mũi tên
    accordionChange = () => {
        this.setState(prevState => ({
            activeKey: prevState.activeKey ? null : "0" // Chuyển trạng thái mở/đóng
        }));
    };
    
    removeItem = (id: string ) => {
        this.props.removeItem(id);
    }

    completedTask = (id: string, date: string, time: string) => { 
        this.props.completedTask(id, date, time);
    };

    updateData = () => {
        console.log('Data updated!');
    }

    render() {
        const dark = {
            background: "#333",
            color: "white"
        };

        const light = {
            color: "#555",
            background: "white"
        };

        return (
            <Accordion 
                style={this.props.isDark ? dark : light} 
                activeKey={this.state.activeKey} // Điều khiển trạng thái của Accordion qua activeKey
            >
                <Card style={this.props.isDark ? dark : light}>
                    <Card.Header style={this.props.isDark ? dark : light}>
                        <Row>
                            <Col>
                                <h2>Archive</h2>
                            </Col>
                            <Col className="ml-auto" >
                                {this.state.activeKey === null ?
                                    <CustomToggle1 onClick={this.accordionChange} /> :
                                    <CustomToggle2 onClick={this.accordionChange} />}
                            </Col>
                        </Row>
                    </Card.Header>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <div className={this.props.doneItems.length !== 0 ? "mr-bottom" : ""}>
                                {this.props.doneItems.length !== 0 ? 
                                    <table style={this.props.isDark ? dark : light} className="table archive table-borderless table-responsive">
                                        <thead className="thead-light">
                                            <tr className="head">
                                                <th scope="col"></th>
                                                <th scope="col">Title</th>
                                                <th scope="col">Priority</th>
                                                <th scope="col">Status</th>
                                                <th scope="col">Description</th>
                                                <th scope="col">Completion Date</th>
                                                <th scope="col">Time</th>   
                                                <th scope="col"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.props.doneItems.map(item => (
                                                <Task
                                                    key={item.key}
                                                    id={item.id}
                                                    desc={item.description}
                                                    priority={item.priority}
                                                    status={item.status}
                                                    label={item.label}
                                                    date={item.date}
                                                    time={item.time}
                                                    comp={"Archive"}
                                                    authToken={item.authToken}
                                                    removeItem={this.removeItem}
                                                    completedTask={this.completedTask} 
                                                    updateData={this.updateData}   
                                                />
                                            ))}
                                        </tbody>
                                    </table> :
                                    <h6 className="text-center no-tasks-message">Complete tasks to see them here.</h6>
                                }
                            </div>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        );
    }
}

export default Archive;
