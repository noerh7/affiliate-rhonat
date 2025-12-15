import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function ClicksSalesChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-4 shadow rounded w-full h-64">
      <h2 className="text-lg font-semibold mb-2">Clics & Ventes</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="clicks" stroke="#3490dc" strokeWidth={2} />
          <Line type="monotone" dataKey="sales" stroke="#38c172" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

