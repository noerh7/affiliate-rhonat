export default function HeatmapClicks({ data }: { data: any[] }) {
  // Créer un tableau pour les 24 heures (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hourStr = String(i).padStart(2, '0');
    const hourData = data?.find((d: any) => d.hour === hourStr) || { hour: hourStr, clicks: 0 };
    return hourData;
  });

  const maxClicks = Math.max(...hours.map((h: any) => h.clicks || 0), 1);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 shadow rounded w-full h-64">
        <h2 className="text-lg font-semibold mb-2">Heatmap des Clics (Par Heure)</h2>
        <div className="flex items-center justify-center h-full text-gray-400">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 shadow rounded w-full">
      <h2 className="text-lg font-semibold mb-4">Heatmap des Clics (Par Heure)</h2>
      <div className="grid grid-cols-12 gap-2">
        {hours.map((hourData: any, i: number) => {
          const clicks = hourData.clicks || 0;
          const intensity = maxClicks > 0 ? Math.min(clicks / maxClicks, 1) : 0;
          return (
            <div
              key={i}
              className="flex flex-col items-center"
            >
              <div
                title={`${hourData.hour}h: ${clicks} clic${clicks > 1 ? 's' : ''}`}
                className="w-full rounded mb-1 flex items-center justify-center text-white text-xs font-semibold transition-all hover:scale-105"
                style={{ 
                  background: `rgba(59,130,246,${0.3 + intensity * 0.7})`,
                  minHeight: '60px'
                }}
              >
                {clicks > 0 && (
                  <span className="text-center">{clicks}</span>
                )}
              </div>
              <span className="text-xs text-gray-500">{hourData.hour}h</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-xs text-gray-500 text-center">
        Passez la souris sur une case pour voir les détails
      </div>
    </div>
  );
}

