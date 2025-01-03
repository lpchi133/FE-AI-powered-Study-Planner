import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const DATA_COUNT = 7;
const NUMBER_CFG = { count: DATA_COUNT, min: 0, max: 200 };

// Fake Utils object để mô phỏng dữ liệu, bạn cần thay thế bằng Utils thực tế nếu có.
const Utils = {
  months: ({ count }: { count: number }) => {
    const months = ["This month"];
    return months.slice(0, count);
  },
  numbers: ({ count, min, max }: { count: number; min: number; max: number }) =>
    Array.from({ length: count }, () =>
      Math.floor(Math.random() * (max - min + 1) + min)
    ),
  CHART_COLORS: {
    red: "rgb(255, 99, 132)",
    blue: "rgb(54, 162, 235)",
  },
  transparentize: (color: string, opacity: number) => {
    const rgba = color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
    return rgba;
  },
};

const labels = Utils.months({ count: DATA_COUNT });
const data = {
  labels: labels,
  datasets: [
    {
      label: "Prepare Project Documentation",
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    },
    {
      label: "Design UI Mockups",
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
    },
    {
      label: "Develop Backend API",
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    },
    {
      label: "Implement User Authentication",
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
    },
    {
      label: "Write Test Cases",
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    },
    {
      label: "Deploy to Production",
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
    },
    {
      label: "Conduct Team Meeting",
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
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
      text: "User Focus Time per Task",
      font: {
        size: 24,
      },
      color: "#000000",
    },
  },
};

export default function BarChart() {
  return (
    <div className=" bg-white shadow p-7 rounded-lg mt-8">
      <div
        style={{ height: "500px", width: "100%" }}
        className="flex justify-center"
      >
        <Bar data={data} options={config} />
      </div>
    </div>
  );
}
