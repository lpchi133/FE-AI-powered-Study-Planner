import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

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
      text: "Task Frequency Over Time",
      font: {
        size: 24,
      },
      color: "#000000",
    },
  },
};

type LineChartProps = {
  tasksByMonthData: {
    labels: string[]; // Danh sách tháng (hoặc ngày) từ tasksByMonthData
    datasets: {
      label: string;
      data: number[];
    }[];
  };
};

export default function LineChart({ tasksByMonthData }: LineChartProps) {
  const data = {
    labels: tasksByMonthData.labels, // Labels từ tasksByMonthData
    datasets: [
      {
        label: "Tasks Quantity", // Nhãn cho dataset
        data: tasksByMonthData.datasets[0].data, // Dữ liệu số lượng task từ tasksByMonthData
        borderColor: "rgb(255, 99, 132)", // Màu đường viền
        backgroundColor: "rgba(255, 99, 132, 0.2)", // Màu nền với độ trong suốt
      },
    ],
  };

  return (
    <div
      style={{
        height: "500px",
        width: "100%",
      }}
      className="flex justify-center"
    >
      <Line data={data} options={config} />
    </div>
  );
}
