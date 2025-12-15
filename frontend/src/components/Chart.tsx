import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function Chart({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-4 shadow rounded w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#3490dc" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

