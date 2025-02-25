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
      display: false,
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
  focusTimePerTaskData: {
    labels: string[]; // Danh sách tên task
    datasets: { label: string; data: number[] }[]; // Một dataset duy nhất cho tất cả các task
  };
};

export default function BarChart({ focusTimePerTaskData }: BarChartProps) {
  // Mảng màu cho mỗi task
  const colors = [
    Utils.CHART_COLORS.red,
    Utils.CHART_COLORS.blue,
    Utils.CHART_COLORS.green,
    Utils.CHART_COLORS.yellow,
    Utils.CHART_COLORS.orange,
  ];

  // Tạo dữ liệu cho bar chart
  const barData = {
    labels: focusTimePerTaskData.labels, // Gắn labels từ props (ví dụ: "Task A", "Task B", ...)
    datasets: [
      {
        label: "Focus Time", // Nhãn chung cho tất cả các dataset (có thể thay đổi nếu cần)
        data: focusTimePerTaskData.datasets[0].data, // Dữ liệu của tất cả các task
        borderColor: colors, // Màu đường viền riêng cho từng cột
        backgroundColor: colors.map((color) =>
          Utils.transparentize(color, 0.5)
        ), // Màu nền riêng cho từng cột
      },
    ],
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
