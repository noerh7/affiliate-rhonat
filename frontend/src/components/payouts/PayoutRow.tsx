export default function PayoutRow({ payout }: { payout: any }) {
  return (
    <div className="bg-white shadow p-3 rounded flex justify-between items-center">
      <span>{payout.amount}€</span>
      <span>{payout.method}</span>
      <span
        className={
          payout.status === 'paid'
            ? 'text-green-600'
            : payout.status === 'failed'
            ? 'text-red-600'
            : 'text-yellow-600'
        }
      >
        {payout.status}
      </span>
      <span>{new Date(payout.created_at).toLocaleDateString()}</span>
    </div>
  );
}
