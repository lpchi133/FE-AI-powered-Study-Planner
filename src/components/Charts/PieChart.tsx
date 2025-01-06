import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Title, Tooltip, Legend);

// Fake Utils object để mô phỏng dữ liệu, cần thay thế bằng Utils thực tế nếu có
const Utils = {
  CHART_COLORS: {
    red: "rgb(255, 99, 132)",
    orange: "rgb(255, 159, 64)",
    yellow: "rgb(255, 205, 86)",
    green: "rgb(75, 192, 192)",
    blue: "rgb(54, 162, 235)",
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
    },
  },
};

type PieChartProps = {
  tasksByStatusData: {
    labels: string[];
    datasets: { label: string; data: number[] }[];
  };
};

export default function PieChart({ tasksByStatusData }: PieChartProps) {
  const pieData = {
    labels: tasksByStatusData.labels, // Lấy labels từ props
    datasets: [
      {
        label: tasksByStatusData.datasets[0].label, // Lấy label từ props
        data: tasksByStatusData.datasets[0].data, // Lấy data từ props
        backgroundColor: Object.values(Utils.CHART_COLORS), // Màu sắc biểu đồ
      },
    ],
  };

  return (
    <div
      style={{ height: "200px", width: "100%" }}
      className="flex justify-center"
    >
      <Pie data={pieData} options={config} />
    </div>
  );
}
