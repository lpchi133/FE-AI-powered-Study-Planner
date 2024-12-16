import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState } from "react";

export default function AIChatBox() {
  const genAI = new GoogleGenerativeAI(import.meta.env.GEMINI_AI_KEY);
  const [text, setText] = useState("");
  const handleClick = async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const tasks = [
      {
        id: 1,
        itemLabel: "Task Label 1",
        itemDescription: "This is the description for task 1.",
        itemStatus: "Pending",
        dueDateTime: "2024-01-12T15:23:45",
        dateTimeSet: "2023-09-12T08:15:30",
        dateTimeModified: "2023-12-14T10:30:00",
        userId: 3,
      },
      {
        id: 2,
        itemLabel: "Task Label 2",
        itemDescription: "This is the description for task 2.",
        itemStatus: "In Progress",
        dueDateTime: "2024-01-18T12:10:30",
        dateTimeSet: "2023-08-14T14:50:10",
        dateTimeModified: "2023-12-14T10:30:00",
        userId: 2,
      },
      {
        id: 3,
        itemLabel: "Task Label 3",
        itemDescription: "This is the description for task 3.",
        itemStatus: "Completed",
        dueDateTime: "2024-01-20T09:00:00",
        dateTimeSet: "2023-06-01T09:10:45",
        dateTimeModified: "2023-12-14T10:30:00",
        userId: 1,
      },
    ];

    const prompt = `
            Analyze this schedule and provide feedback:
            ${JSON.stringify(tasks)}
            Feedback:
            1. Are there any tight schedules?
            2. Suggestions for prioritization.
            3. Recommendations for balance and focus.
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = await response.text();
    console.log(generatedText);

    // Cập nhật state để React re-render
    setText(generatedText);
  };

  return (
    <div className="flex flex-col items-center mt-20 h-screen bg-gray-100">
      <button
        onClick={handleClick}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        CLICK
      </button>
      <p className="m-4 text-gray-800 whitespace-pre-wrap">{text}</p>
    </div>
  );
}
