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

// Fake Utils object để mô phỏng dữ liệu, bạn cần thay thế bằng Utils thực tế nếu có.
const Utils = {
  transparentize: (color: string, opacity: number) => {
    const rgba = color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
    return rgba;
  },
  CHART_COLORS: {
    red: "rgb(255, 99, 132)",
    blue: "rgb(54, 162, 235)",
    green: "rgb(75, 192, 192)",
    yellow: "rgb(255, 205, 86)",
    orange: "rgb(255, 159, 64)",
  },
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
      display: true,
    },
    title: {
      text: "User Focus Time per Task",
      font: {
        size: 24,
      },
      color: "#000000",
      display: false,
    },
  },
};

type BarChartProps = {
  dailyTaskTimeSpentData: {
    labels: string[];
    datasets: { label: string; data: number[]; stack: string }[];
  };
};

export default function BarChart1({ dailyTaskTimeSpentData }: BarChartProps) {
  // Tạo dữ liệu cho bar chart
  const barData = {
    labels: dailyTaskTimeSpentData.labels, // Sử dụng labels từ dailyTaskTimeSpentData
    datasets: dailyTaskTimeSpentData.datasets.map((dataset, index) => ({
      label: dataset.label, // Nhãn của dataset
      data: dataset.data, // Dữ liệu của dataset
      stack: dataset.stack, // Thêm thuộc tính stack cho mỗi dataset
      borderColor: Object.values(Utils.CHART_COLORS)[index % 5], // Màu viền (xoay vòng)
      backgroundColor: Utils.transparentize(
        Object.values(Utils.CHART_COLORS)[index % 5],
        0.5
      ), // Màu nền (xoay vòng với độ trong suốt)
    })),
  };

  return (
    <div
      style={{ height: "500px", width: "100%" }}
      className="flex justify-center mt-4"
    >
      <Bar data={barData} options={config} />
    </div>
  );
}
