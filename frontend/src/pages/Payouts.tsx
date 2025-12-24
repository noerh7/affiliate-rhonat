import { useEffect, useState } from 'react';
import { getPayoutMethods, requestPayout, getPayoutHistory, exportPayoutsCSV } from '../api/payouts';
import Sidebar from '../components/Sidebar';
import PayoutRow from '../components/payouts/PayoutRow';
import { useTranslation } from 'react-i18next';

export default function Payouts() {
  const { t } = useTranslation();
  const [methods, setMethods] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    getPayoutMethods().then((r) => setMethods(r.data ?? []));
    getPayoutHistory().then((r) => setHistory(r.data ?? []));
  }, []);

  async function pay() {
    await requestPayout(Number(amount));
    alert('Demande envoyée');
    setAmount('');
    getPayoutHistory().then((r) => setHistory(r.data ?? []));
  }

  function handleExport() {
    exportPayoutsCSV(history);
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="p-6 w-full">
        <h1 className="text-2xl font-bold mb-4">{t('payouts.title')}</h1>
        <div className="bg-white p-4 shadow rounded mb-6">
          <h2 className="font-semibold text-lg mb-2">Demander un paiement</h2>
          <input
            className="border p-2 mr-2"
            placeholder="Montant"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
          />
          <button className="bg-blue-600 text-white p-2" onClick={pay}>
            {t('payouts.requestPayout')}
          </button>
        </div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Historique des paiements</h2>
          <button className="bg-gray-600 text-white p-2 text-sm" onClick={handleExport}>
            Exporter CSV
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {history.map((h) => (
            <PayoutRow key={h.id} payout={h} />
          ))}
        </div>
      </main>
    </div>
  );
}
