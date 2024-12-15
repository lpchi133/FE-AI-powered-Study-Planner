import React from 'react';
import { ChangeEvent } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import InputGroup from 'react-bootstrap/InputGroup';

interface Task {
    id: string;
    description: string;
    priority: string;
    status: string;
    label: string;
    // start_date: string;
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
                // start_date: this.props.editTask.start_date,
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

        fetch(`${import.meta.env.VITE_ENDPOINT_URL}/users/updateTask`, requestOptions)
            .then(response => {
                if (response.status === 201) {
                    this.props.updateData();
                    this.props.onHide();
                    // this.handleReset();
                    alert('Task Edited.');
                } else {
                    alert("There was some problem with that. We're currently working on fixing it. Thank You.");
                }
            });
    };

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.stopPropagation();
            this.setValidated(true);
        } else {
            const nowDate = Date.now();
            const dueDate = new Date(`${this.state.item.date} ${this.state.item.time}`);
            const daysDiff = (dueDate.getTime() - nowDate) / (1000 * 3600 * 24);
            let val = 'Ongoing';

            if (daysDiff < 0) {
                val = 'Overdue';
            } else if (daysDiff <= 2) {
                val = 'Pending';
            }

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
                // start_date: '',
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
                                <Form.Group as={Col} md="12" controlId="validationPriority">
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
                            </Row>
                            <Row>
                                <Form.Group as={Col} md="4" controlId="validationDate">
                                    <InputGroup>
                                        
                                        <InputGroup.Text id="inputGroupPrepend">Date</InputGroup.Text>
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
                                        <InputGroup.Text id="inputGroupPrepend">Time</InputGroup.Text>
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
                                <Form.Group as={Col} md="4" controlId="validationLabel">
                                    <Form.Control
                                        type="text"
                                        name="label"
                                        placeholder="Enter Label"
                                        value={this.state.item.label}
                                        onChange={this.handleInputChange}
                                        style={this.props.isDark ? dark : undefined}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please enter label.
                                    </Form.Control.Feedback>
                                    <Form.Control.Feedback>
                                        Looks good.
                                    </Form.Control.Feedback>
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