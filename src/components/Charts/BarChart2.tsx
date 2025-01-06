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

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

// Cấu hình màu sắc (bạn có thể thay đổi theo ý muốn)
const Utils = {
  CHART_COLORS: {
    red: "rgb(255, 99, 132)",
    blue: "rgb(54, 162, 235)",
    green: "rgb(75, 192, 192)",
    yellow: "rgb(255, 205, 86)",
    orange: "rgb(255, 159, 64)",
  },
  transparentize: (color: string, opacity: number) => {
    const rgba = color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
    return rgba;
  },
};

type BarChartProps = {
  tasksByPriorityData: {
    labels: string[];
    datasets: { label: string; data: number[] }[];
  };
};

export default function BarChart2({ tasksByPriorityData }: BarChartProps) {
  const barData = {
    labels: tasksByPriorityData.labels, // Labels cho trục X
    datasets: tasksByPriorityData.datasets.map((dataset, index) => ({
      label: dataset.label, // Nhãn của dataset
      data: dataset.data, // Dữ liệu của dataset
      borderColor: Object.values(Utils.CHART_COLORS)[index % 5], // Màu viền (xoay vòng)
      backgroundColor: Utils.transparentize(
        Object.values(Utils.CHART_COLORS)[index % 5],
        0.5
      ), // Màu nền (xoay vòng với độ trong suốt)
    })),
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
        display: false,
        text: "Tasks by Priority",
        font: {
          size: 24,
        },
        color: "#000000",
      },
    },
  };

  return (
    <div
      style={{ height: "350px", width: "100%" }}
      className="flex justify-center"
    >
      <Bar data={barData} options={config} />
    </div>
  );
}
