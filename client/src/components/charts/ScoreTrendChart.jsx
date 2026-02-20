import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { test: "Test 1", score: 65 },
  { test: "Test 2", score: 72 },
  { test: "Test 3", score: 80 },
  { test: "Test 4", score: 76 },
];

export default function ScoreTrendChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="font-semibold mb-4">Overall Score Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="test" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#4f46e5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
