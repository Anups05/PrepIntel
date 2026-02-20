import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { subject: "Math", accuracy: 85 },
  { subject: "Physics", accuracy: 70 },
  { subject: "Chemistry", accuracy: 62 },
];

export default function SubjectAccuracyChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="font-semibold mb-4">Subject-wise Accuracy</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="subject" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="accuracy" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
