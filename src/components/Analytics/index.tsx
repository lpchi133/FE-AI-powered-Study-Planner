import React from "react";
import BarChart from "../Charts/BarChart";
import LineChart from "../Charts/LineChart";
import PieChart from "../Charts/PieChart";
import { Button, Form, InputGroup } from "react-bootstrap";
import { faSearch, faRedoAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Analytics() {
  return (
    <div className="bg-blue-300 pt-24 px-16 pb-16">
      <div className="flex" style={{ width: "100%" }}>
        <div style={{ width: "15%" }} className="mr-24">
          <Form.Group controlId="validationSelect">
            <Form.Select aria-label="Select time range" className="form-select">
              <option value="1">Today</option>
              <option value="2">This week</option>
              <option value="3">This month</option>
              <option value="4">This year</option>
            </Form.Select>
          </Form.Group>
        </div>

        <div className="flex space-x-3 mr-48" style={{ width: "35%" }}>
          <Form.Group controlId="validationFromDate" style={{ width: "260px" }}>
            <InputGroup>
              <InputGroup.Text id="inputGroupPrepend1">From</InputGroup.Text>
              <Form.Control
                type="datetime-local"
                // {...methods.register("fromDate")}
                aria-describedby="inputGroupPrepend1"
              />
              <Form.Control.Feedback type="invalid">
                Please choose a proper date.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <Form.Group controlId="validationToDate" style={{ width: "260px" }}>
            <InputGroup>
              <InputGroup.Text id="inputGroupPrepend2">To</InputGroup.Text>
              <Form.Control
                type="datetime-local"
                // {...methods.register("toDate")}
                aria-describedby="inputGroupPrepend2"
              />
              <Form.Control.Feedback type="invalid">
                Please choose a proper date.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </div>

        <div className="flex justify-end space-x-3" style={{ width: "30%" }}>
          <Form.Group controlId="validationSubmit" style={{ width: "30%" }}>
            <Button
              className="search-btn btn-block"
              variant="primary"
              type="submit"
            >
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </Form.Group>

          <Form.Group controlId="validationReset" style={{ width: "30%" }}>
            <Button
              className="search-btn btn-block"
              variant="danger"
              type="reset"

              // onClick={onRefresh}
            >
              <FontAwesomeIcon icon={faRedoAlt} />
            </Button>
          </Form.Group>
        </div>
      </div>

      <div className="flex bg-white shadow p-7 rounded-lg mt-8">
        <PieChart />
        <div
          className="flex justify-center ml-7 py-6 pl-6 pr-3 rounded-lg border-2 border-blue-300"
          style={{ width: "61%", height: "500px" }}
        >
          <div
            className="flex flex-col items-start"
            style={{ overflowY: "auto" }}
          >
            <div className="text-xl font-bold text-blue-600 mb-2">
              ✨ AI-powered Feedback:
            </div>
            <div className="mr-2">
              AI-powered Study Planner PROJECT IDEA & PURPOSE The AI-powered
              Study Planner is a web application designed to help students and
              lifelong learners manage their study schedules effectively. It
              leverages AI to enhance user experience by providing personalized
              feedback and insights, optimizing learning efficiency, and
              ensuring sustainable time management. CORE FEATURES Authentication
              & Profile Management Sign Up: Create an account using email and
              password or social sign-in. Login: Access accounts via
              email/password or social sign-in. Logout: Securely terminate user
              sessions. Update full name, profile picture, and password.
              Scheduling & Task Management Task Management: Users click on the
              “Add Task” button and input some fields such as task name,
              description, priority level (High/Medium/Low), estimated time,
              status (Todo/In Progress/Completed/Expired) Users can view the
              list of tasks, search tasks, filter, or sort them based on their
              priority and status. Users can click on any specific task to
              update or delete it from the task list. Task Scheduling (Calendar
              view): Users distribute tasks into available time slots by
              dragging and dropping tasks onto a calendar interface. The status
              of the tasks can be automatically updated if these tasks are
              distributed on the calendar. For example, The task is “Todo” but
              if the users drag it to the past, it becomes “Expired”. AI
              Suggestions: Users click on “Analyze Schedule" to send task data,
              and schedule details to an LLM. Provide feedback on potential
              adjustments, such as: Warning about overly tight schedules that
              may lead to burnout. Recommending prioritization changes for
              improved focus and balance. Focus Timer Start the focus timer:
              Users choose a task on the calendar interface, set timer duration
              (e.g., 25 minutes for a Pomodoro session) and optional break
              duration (e.g. 5 minutes), and then start a timer for that task to
              track focus sessions. Display session duration and provide visual
              cues like a countdown or progress bar. During the timer session:
              Users focus on the task while the timer runs and can not use other
              in-app features. They can end the timer early if needed. End of
              the timer session: At the end of the timer session, users receive
              a notification that the session is complete. They can mark the
              task as completed, start the break timer, or restart the focus
              timer for another session. Note and edge cases: Prevent starting
              the timer for tasks that are not “In progress”. If the task
              deadline is met before the timer ends, end the timer immediately
              and notify the user.
            </div>
          </div>
        </div>
      </div>
      <BarChart />
      <LineChart />
    </div>
  );
}
