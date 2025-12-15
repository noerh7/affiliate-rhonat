
export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
        <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
        {label}
      </div>
      <span className="text-3xl font-semibold text-gray-900">{value}</span>
    </div>
  );
}
