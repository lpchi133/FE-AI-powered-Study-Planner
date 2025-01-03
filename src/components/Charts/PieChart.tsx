import React from "react";
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Title, Tooltip, Legend);

// Fake Utils object để mô phỏng dữ liệu, cần thay thế bằng Utils thực tế nếu có
const Utils = {
  numbers: ({ count, min, max }: { count: number; min: number; max: number }) =>
    Array.from({ length: count }, () =>
      Math.floor(Math.random() * (max - min + 1) + min)
    ),
  CHART_COLORS: {
    red: "rgb(255, 99, 132)",
    orange: "rgb(255, 159, 64)",
    yellow: "rgb(255, 205, 86)",
    green: "rgb(75, 192, 192)",
    blue: "rgb(54, 162, 235)",
  },
};

const DATA_COUNT = 4;
const NUMBER_CFG = { count: DATA_COUNT, min: 0, max: 100 };

const data = {
  labels: ["Not started", "Over due", "Pending", "On going"],
  datasets: [
    {
      label: "This month",
      data: Utils.numbers(NUMBER_CFG),
      backgroundColor: Object.values(Utils.CHART_COLORS),
    },
  ],
};

const config = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        font: {
          size: 14,
        },
        color: "#2F4F4F",
      },
    },
    title: {
      display: true,
      text: "Task Status Distribution",
      font: {
        size: 24,
      },
      color: "#000000",
    },
  },
};

export default function PieChart() {
  return (
    <div style={{ height: "500px", width: "500px" }}>
      <Pie data={data} options={config} />
    </div>
  );
}
