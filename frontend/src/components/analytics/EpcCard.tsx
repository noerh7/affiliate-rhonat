export default function EpcCard({ clicks, revenue }: { clicks: number; revenue: number }) {
  const epc = clicks ? (revenue / clicks).toFixed(2) : 0;
  return (
    <div className="p-4 bg-white rounded shadow">
      <span className="text-gray-500 text-sm">EPC (Earnings Per Click)</span>
      <span className="text-2xl font-bold">{epc}€</span>
    </div>
  );
}
