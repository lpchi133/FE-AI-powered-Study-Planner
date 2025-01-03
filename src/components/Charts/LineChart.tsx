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

// Fake Utils object để mô phỏng dữ liệu, cần thay thế bằng Utils thực tế nếu có
const Utils = {
  months: ({ count }: { count: number }) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
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

const DATA_COUNT = 7;
const NUMBER_CFG = { count: DATA_COUNT, min: 0, max: 200 };

const labels = Utils.months({ count: 7 });
const data = {
  labels: labels,
  datasets: [
    {
      label: "Tasks",
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    },
    // {
    //   label: "Dataset 2",
    //   data: Utils.numbers(NUMBER_CFG),
    //   borderColor: Utils.CHART_COLORS.blue,
    //   backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
    // },
  ],
};

const config = {
  type: "line",
  data: data,

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
      text: "Task Frequency Over Time",
      font: {
        size: 24,
      },
      color: "#000000",
    },
  },
};

export default function LineChart() {
  return (
    <div className=" bg-white shadow p-7 rounded-lg mt-8">
      <div
        style={{ height: "500px", width: "100%" }}
        className="flex justify-center"
      >
        <Line data={data} options={config} />
      </div>
    </div>
  );
}
