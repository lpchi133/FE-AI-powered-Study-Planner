import React from 'react';
import { ChangeEvent } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import InputGroup from 'react-bootstrap/InputGroup';
import { toast } from 'react-toastify';

interface Task {
    id: string;
    description: string;
    priority: string;
    status: string;
    label: string;
    start_date: string;
    start_time: string;
    date: string;
    time: string;
}

interface EditTaskProps {
    editTask: Task;
    authToken: string | null;
    updateData: () => void;
    onHide: () => void;
    show: boolean;
    isDark?: boolean;
}

interface EditTaskState {
    validated: boolean;
    item: Task;
}

class EditTask extends React.Component<EditTaskProps, EditTaskState> {

    constructor(props: EditTaskProps) {
        super(props);
        this.state = {
            validated: false,
            item: {
                id: this.props.editTask.id,
                description: this.props.editTask.description,
                priority: this.props.editTask.priority,
                status: this.props.editTask.status,
                label: this.props.editTask.label,
                start_date: this.props.editTask.start_date,
                start_time: this.props.editTask.start_time.slice(0, 5), 
                date: this.props.editTask.date,
                time: this.props.editTask.time.slice(0, 5),
            },
        };
    }

    setValidated = (val: boolean) => {
        this.setState({ validated: val });
    };

    editTask = () => {
        const updateItem: Task = { ...this.state.item };

        const accessToken = this.props.authToken;
        
        const requestOptions = {
            method: 'POST',
            headers: { 
                "Content-Type": "application/json",
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(updateItem) 
        };

        fetch(`${import.meta.env.VITE_ENDPOINT_URL}/tasks/updateTask`, requestOptions)
            .then(response => {
                if (response.status === 201) {
                    this.props.updateData();
                    this.props.onHide();
                    // this.handleReset();
                    toast.success('Task Edited.');
                } else {
                    toast.error("There was some problem with that. We're currently working on fixing it. Thank You.");
                }
            });
    };

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
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
            this.setState(
                prevState => ({
                    item: { ...prevState.item, status: val },
                }),
                this.editTask
            );

            this.setValidated(false);
        }
    };

    handleReset = () => {
        this.setState({
            item: {
                id: '',
                description: '',
                priority: '',
                status: '',
                label: '',
                start_date: '',
                start_time: '',
                date: '',
                time: '',
            },
        });
        this.setValidated(false);
    };

    handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = event.target;
        const { name, value } = target;

        this.setState(prevState => ({
            item: { ...prevState.item, [name]: value },
        }));
    };

    render() {
        const dark = {
            background: '#333',
            color: 'white',
        };

        const light = {
            color: '#555',
            background: 'white',
        };

        return (
            <div style={this.props.isDark ? dark : light}>
                <Modal
                    show={this.props.show}
                    onHide={this.props.onHide}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header style={this.props.isDark ? dark : light} closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            <h2 className="py-1" style={{ fontWeight: 600 }}>
                                Edit Task
                            </h2>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={this.props.isDark ? dark : light}>
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
                                        placeholder="Edit the Description"
                                        value={this.state.item.description}
                                        onChange={this.handleInputChange}
                                        style={{
                                            ...(this.props.isDark === true ? dark : undefined),
                                            marginBottom: '15px' // Thêm khoảng cách dưới
                                        }}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please enter the task details.
                                    </Form.Control.Feedback>
                                    <Form.Control.Feedback>
                                        Looks good.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row>
                                
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
                                    <Form.Control.Feedback type="invalid">
                                        Please enter label.
                                    </Form.Control.Feedback>
                                    <Form.Control.Feedback>
                                        Looks good.
                                    </Form.Control.Feedback>
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
                                            style={this.props.isDark ? dark : undefined}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please choose a proper deadline.
                                        </Form.Control.Feedback>
                                        <Form.Control.Feedback>
                                            Looks good.
                                        </Form.Control.Feedback>
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
                                            style={this.props.isDark ? dark : undefined}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please choose a proper reminder time.
                                        </Form.Control.Feedback>
                                        <Form.Control.Feedback>
                                            Looks good.
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                            </Row>
                            <Row>
                            <Form.Group as={Col} md="4" controlId="validationPriority">
                                    <Form.Select
                                        required
                                        name="priority"
                                        value={this.state.item.priority}
                                        onChange={this.handleInputChange}
                                        style={{
                                            ...(this.props.isDark === true ? dark : undefined),
                                            marginBottom: '15px' // Thêm khoảng cách dưới
                                        }}
                                    >
                                        <option value="">Select Priority</option>
                                        <option value="HIGH">High</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="LOW">Low</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        Please enter the task details.
                                    </Form.Control.Feedback>
                                    <Form.Control.Feedback>
                                        Looks good.
                                    </Form.Control.Feedback>
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
                                            style={this.props.isDark ? dark : undefined}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please choose a proper deadline.
                                        </Form.Control.Feedback>
                                        <Form.Control.Feedback>
                                            Looks good.
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group as={Col} md="4" controlId="validationTime">
                                    <InputGroup>                                     
                                        <InputGroup.Text id="inputGroupPrepend">End Time</InputGroup.Text>
                                        <Form.Control
                                            type="time"
                                            name="time"
                                            aria-describedby="inputGroupPrepend"
                                            value={this.state.item.time}
                                            onChange={this.handleInputChange}
                                            style={this.props.isDark ? dark : undefined}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please choose a proper reminder time.
                                        </Form.Control.Feedback>
                                        <Form.Control.Feedback>
                                            Looks good.
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                                
                            </Row>
                            <Row>
                                <Form.Group className="offset-md-3 col-md-2 mb-3">
                                    <button className="btn btn-primary btn-lg" type="submit" id="add-btn">
                                        Edit
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

export default EditTask;