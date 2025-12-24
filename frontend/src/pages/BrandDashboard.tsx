import Sidebar from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import { useTranslation } from 'react-i18next';

export default function BrandDashboard() {
  const { t } = useTranslation();

  return (
    <div className="flex">
      <Sidebar />
      <main className="p-6 w-full flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{t('nav.brand')}</h1>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label={t('products.totalAffiliates')} value="0" />
          <StatCard label={t('dashboard.totalSales')} value="0" />
          <StatCard label={t('dashboard.commission')} value="0€" />
        </div>
      </main>
    </div>
  );
}
