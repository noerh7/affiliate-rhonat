export default function ConversionFunnel({ clicks, sales }: { clicks: number; sales: number }) {
  const rate = clicks ? ((sales / clicks) * 100).toFixed(2) : 0;
  return (
    <div className="bg-white p-4 shadow rounded w-full">
      <h2 className="text-lg font-semibold mb-2">Tunnel de Conversion</h2>
      <div className="flex flex-col gap-2">
        <div>
          <span className="font-semibold">Clics :</span> {clicks}
        </div>
        <div>
          <span className="font-semibold">Ventes :</span> {sales}
        </div>
        <div>
          <span className="font-semibold">Taux de conversion :</span> {rate}%
        </div>
      </div>
    </div>
  );
}

