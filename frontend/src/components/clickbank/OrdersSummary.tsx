import type { OrdersResponse, Order } from '../../api/clickbank';

type Props = {
  ordersResponse: OrdersResponse;
};

function computeTotals(orders: Order[]) {
  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  const byType: Record<string, number> = {};
  const byRole: Record<string, number> = {};

  for (const o of orders) {
    const typeKey = o.transactionType || 'UNKNOWN';
    const roleKey = o.role || 'UNKNOWN';
    byType[typeKey] = (byType[typeKey] || 0) + 1;
    byRole[roleKey] = (byRole[roleKey] || 0) + 1;
  }

  return { totalOrders, totalAmount, byType, byRole };
}

export default function OrdersSummary({ ordersResponse }: Props) {
  const { orders } = ordersResponse;
  const { totalOrders, totalAmount, byType, byRole } = computeTotals(orders);

  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="bg-slate-50 border rounded-lg p-3">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          Nombre de commandes (Orders API)
        </p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{totalOrders}</p>
        <p className="text-xs text-gray-500 mt-1">
          Total des reçus retournés par <code>GET /1.3/orders2/list</code>.
        </p>
      </div>
      <div className="bg-slate-50 border rounded-lg p-3">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          Montant total (champ <code>amount</code>)
        </p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">
          {totalAmount.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Somme des montants de commande pour la page courante.
        </p>
      </div>
      <div className="bg-slate-50 border rounded-lg p-3 space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          Répartition par type / rôle
        </p>
        <div className="text-xs text-gray-700 flex flex-wrap gap-2">
          {Object.entries(byType).map(([type, count]) => (
            <span
              key={type}
              className="inline-flex items-center rounded-full bg-white border px-2 py-0.5"
            >
              <span className="font-semibold mr-1">{type}</span>
              <span className="text-gray-500">({count})</span>
            </span>
          ))}
        </div>
        <div className="text-xs text-gray-700 flex flex-wrap gap-2">
          {Object.entries(byRole).map(([role, count]) => (
            <span
              key={role}
              className="inline-flex items-center rounded-full bg-white border px-2 py-0.5"
            >
              <span className="font-semibold mr-1">{role}</span>
              <span className="text-gray-500">({count})</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}


