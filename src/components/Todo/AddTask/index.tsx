import React, { FormEvent } from 'react';
import { ChangeEvent } from 'react';
import './AddTask.css';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import InputGroup from 'react-bootstrap/InputGroup';
import { toast } from 'react-toastify';

interface AddTaskProps {
    show: boolean;
    onHide: () => void;
    isDark?: boolean;
    authToken: string | null;
    addnewtask: (task: TaskItem) => void;
}

interface AddTaskState {
    validated: boolean;
    item: TaskItem;
}

interface TaskItem {
    id: string;
    priority: string;
    description: string;
    status: string;
    label: string;
    start_date: string;
    start_time: string;
    date: string;
    time: string;
}

class AddTask extends React.Component<AddTaskProps, AddTaskState> {
    constructor(props: AddTaskProps) {
        super(props);
        this.state = {
            validated: false,
            item: {
                id: '',
                priority: '',
                description: '',
                status: '',
                label: '',
                start_date: '',
                start_time: '',
                date: '',
                time: ''
            }
        };
    }

    setValidated = (val: boolean) => {
        this.setState({
            validated: val
        });
    };

    addNewTask = () => {
        const sendItem = {
            description: this.state.item.description,
            priority: this.state.item.priority,
            status: this.state.item.status,
            label: this.state.item.label,
            start_date: this.state.item.start_date,
            start_time: this.state.item.start_time,
            date: this.state.item.date,
            time: this.state.item.time
        };
        console.log("sendItem:", sendItem);
        const accessToken = this.props.authToken;

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(sendItem)
        };

        fetch(`${import.meta.env.VITE_ENDPOINT_URL}/tasks/createTask`, requestOptions)
            .then((response) => {
                if (response.status === 201) {
                    this.props.addnewtask(this.state.item);
                    this.props.onHide();
                    this.handleReset();
                    toast.success('Task Added Successfully');
                } else {
                    toast.error("There was some problem with that. We're currently working on fixing it. Thank You.");
                }
            })
            .then((data) => {
                console.log(data);
            });
    };

    handleSubmit = (event: FormEvent) => {
        const form = event.currentTarget as HTMLFormElement;

        
        event.preventDefault();

        const fDate = new Date(this.state.item.start_date + " " + this.state.item.start_time);
        const tDate = new Date(this.state.item.date + " " + this.state.item.time);

        const daysDiff = (tDate.getTime() - fDate.getTime()) / (1000 * 3600 * 24);

        if (form.checkValidity() === false || (daysDiff < 0 || Number.isNaN(daysDiff))) {
            event.stopPropagation();
            if (daysDiff < 0) {
                this.setValidated(false);
                toast.error("Select The Dates Properly.");
            } else {
            this.setValidated(true);
            }
        } else {
            const nowDate = Date.now();
            const StartDate = new Date(this.state.item.start_date + ' ' + this.state.item.start_time);
            const dueDate = new Date(this.state.item.date + ' ' + this.state.item.time);
            const daysDiff = (dueDate.getTime() - StartDate.getTime()) / (1000 * 3600 * 24);
            let val = 'Ongoing';
            
            // So sánh StartDate với nowDate
            if (StartDate.getTime() > nowDate) {
                val = 'NotStarted'; // StartDate nằm trong tương lai
            } else if (daysDiff < 0) {
                val = 'Overdue'; // dueDate đã qua
            } else if (daysDiff <= 2) {
                val = 'Pending'; // Còn ít hơn hoặc bằng 2 ngày
            } else {
                val = 'Ongoing'; // Trường hợp còn lại
            }
            console.log(val);
            const newItem = this.state.item;
            newItem.status = val;
            this.setState(
                {
                    item: newItem
                },
                this.addNewTask
            );

            this.setValidated(false);
        }
    };

    handleReset = () => {
        const newitem = {
            id: '',
            priority: '',
            description: '',
            status: '',
            label: '',
            start_date: '',
            start_time: '',
            date: '',
            time: ''
        };

        this.setState({
            item: newitem
        });

        this.setValidated(false);
    };

    handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = event.target;
        const value: string = target.value;
        const name = target.name;
    
        const newitem = { ...this.state.item };
        newitem[name as keyof TaskItem] = value;
    
        this.setState({
            item: newitem
        });
    };

    render() {
        const dark = {
            background: '#333',
            color: 'white'
        };

        const light = {
            color: '#555',
            background: 'white'
        };

        return (
            <div style={this.props.isDark === true ? dark : light}>
                <Modal
                    show={this.props.show}
                    onHide={this.props.onHide}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header style={this.props.isDark === true ? dark : light} closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            <h2 className="py-1" style={{ fontWeight: 600 }}>
                                Add Task
                            </h2>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={this.props.isDark === true ? dark : light}>
                        <Form
                            noValidate
                            validated={this.state.validated}
                            onSubmit={this.handleSubmit}
                            onReset={this.handleReset}
                        >
                            <Row>
                                <Form.Group as={Col} md="12" controlId="validationTitle">
                                    <Form.Control
                                        required
                                        type="text"
                                        name="description"
                                        placeholder="Enter The Description"
                                        value={this.state.item.description}
                                        onChange={this.handleInputChange}
                                        style={{
                                            ...(this.props.isDark === true ? dark : undefined),
                                            marginBottom: '15px' // Thêm khoảng cách dưới
                                        }}
                                    />
                                    <Form.Control.Feedback type="invalid">Please enter the task details.</Form.Control.Feedback>
                                    <Form.Control.Feedback>Looks good.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row >
                                <Form.Group as={Col} md="4" controlId="validationLabel">
                                    <Form.Control
                                        type="text"
                                        name="label"
                                        placeholder="Enter Label"
                                        value={this.state.item.label}
                                        onChange={this.handleInputChange}
                                        style={{
                                            ...(this.props.isDark === true ? dark : undefined),
                                            marginBottom: '15px' // Adding margin bottom
                                        }}
                                        
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">Please enter label.</Form.Control.Feedback>
                                    <Form.Control.Feedback>Looks good.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} md="4" controlId="validationDate" style={{marginBottom: '15px'}}>
                                    <InputGroup>
                                        <InputGroup.Text id="inputGroupPrepend">Start Date</InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            name="start_date"
                                            aria-describedby="inputGroupPrepend"
                                            value={this.state.item.start_date}
                                            onChange={this.handleInputChange}
                                            style={this.props.isDark === true ? dark : undefined}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">Please choose a proper start.</Form.Control.Feedback>
                                        <Form.Control.Feedback>Looks good.</Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group as={Col} md="4" controlId="validationTime" style={{marginBottom: '15px'}}>
                                    <InputGroup>
                                            <InputGroup.Text id="inputGroupPrepend">Start Time</InputGroup.Text>
                                        <Form.Control
                                            type="time"
                                            name="start_time"
                                            aria-describedby="inputGroupPrepend"
                                            value={this.state.item.start_time}
                                            onChange={this.handleInputChange}
                                            style={this.props.isDark === true ? dark : undefined}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">Please choose a proper start time.</Form.Control.Feedback>
                                        <Form.Control.Feedback>Looks good.</Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                            </Row>

                            <Row >
                                <Form.Group as={Col} md="4" controlId="validationPriority">
                                    <Form.Select
                                        required
                                        name="priority"
                                        value={this.state.item.priority}
                                        onChange={this.handleInputChange}
                                        style={{
                                            ...(this.props.isDark === true ? dark : undefined),
                                            marginBottom: '15px' // Adding margin bottom
                                        }}
                                    >
                                        <option value="">Select Priority</option>
                                        <option value="HIGH">High</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="LOW">Low</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">Please select the priority of the task.</Form.Control.Feedback>
                                    <Form.Control.Feedback>Looks good.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} md="4" controlId="validationDate" style={{marginBottom: '15px'}}>
                                    <InputGroup>
                                        <InputGroup.Text id="inputGroupPrepend">End Date</InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            name="date"
                                            aria-describedby="inputGroupPrepend"
                                            value={this.state.item.date}
                                            onChange={this.handleInputChange}
                                            style={this.props.isDark === true ? dark : undefined}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">Please choose a proper deadline.</Form.Control.Feedback>
                                        <Form.Control.Feedback>Looks good.</Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group as={Col} md="4" controlId="validationTime" style={{marginBottom: '15px'}}>
                                    <InputGroup>
                                            <InputGroup.Text id="inputGroupPrepend">End Time</InputGroup.Text>
                                        <Form.Control
                                            type="time"
                                            name="time"
                                            aria-describedby="inputGroupPrepend"
                                            value={this.state.item.time}
                                            onChange={this.handleInputChange}
                                            style={this.props.isDark === true ? dark : undefined}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">Please choose a proper reminder time.</Form.Control.Feedback>
                                        <Form.Control.Feedback>Looks good.</Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                                
                            </Row>
                            <Row>
                                <Form.Group className="offset-md-3 col-md-2 mb-3">
                                    <button className="btn btn-primary btn-lg" type="submit" id="add-btn">
                                        Add
                                    </button>
                                </Form.Group>
                                <Form.Group className="offset-md-2 col-md-2 mb-3">
                                    <button className="btn btn-danger btn-lg" type="reset" id="reset-btn">
                                        Reset
                                    </button>
                                </Form.Group>
                            </Row>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}

export default AddTask;
