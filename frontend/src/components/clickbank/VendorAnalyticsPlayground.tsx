import { FormEvent, useMemo, useState } from 'react';
import { getClicksAnalytics, type AnalyticsResponse } from '../../api/clickbank';

type Props = {
  apiKey: string;
};

type VendorAnalyticsFilters = {
  account: string;
  startDate: string;
  endDate: string;
  select: string;
};

const DEFAULT_FILTERS: VendorAnalyticsFilters = {
  account: 'freenzy',
  startDate: '2025-12-01',
  endDate: '2025-12-11',
  select: 'HOP_COUNT,SALE_COUNT',
};

export default function VendorAnalyticsPlayground({ apiKey }: Props) {
  const [filters, setFilters] = useState<VendorAnalyticsFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiKeyPreview = useMemo(() => {
    if (!apiKey) return 'VOTRE_CLE_API';
    if (apiKey.length <= 8) return apiKey;
    return `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 2)}`;
  }, [apiKey]);

  const curlPreview = useMemo(() => {
    const parts = [
      'curl.exe -X GET "https://api.clickbank.com/rest/1.3/analytics/affiliate/vendor"',
      `-H "Authorization: API-${apiKeyPreview}"`,
      '-H "Accept: application/json"',
      `-d "account=${filters.account || '<account>'}"`,
      `-d "startDate=${filters.startDate || '<yyyy-mm-dd>'}"`,
      `-d "endDate=${filters.endDate || '<yyyy-mm-dd>'}"`,
      `-d "select=${filters.select || '<METRICS>'}"`,
    ];
    return parts.join(' ');
  }, [filters.account, filters.endDate, filters.select, filters.startDate, apiKeyPreview]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!apiKey) {
      setError('Veuillez renseigner votre Developer API Key pour exécuter la requête.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await getClicksAnalytics(
        { apiKey },
        {
          role: 'AFFILIATE',
          dimension: 'vendor',
          account: filters.account,
          startDate: filters.startDate,
          endDate: filters.endDate,
          select: filters.select,
        }
      );
      setResult(response);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Analytics vendor paramétrables</h2>
          <p className="text-sm text-gray-600">
            Renseignez les paramètres équivalents à la requête cURL <code>-d "account=..."</code>,{' '}
            <code>-d "startDate=..."</code>, <code>-d "endDate=..."</code> et <code>-d "select=..."</code>.
          </p>
        </div>
        <span className="badge-soft">Playground</span>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Account (vendor)</span>
          <input
            className="input"
            placeholder="ex: freenzy"
            value={filters.account}
            onChange={(e) => setFilters((prev) => ({ ...prev, account: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Select (metrics)</span>
          <input
            className="input"
            placeholder="ex: HOP_COUNT,SALE_COUNT"
            value={filters.select}
            onChange={(e) => setFilters((prev) => ({ ...prev, select: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Date de début</span>
          <input
            type="date"
            className="input"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Date de fin</span>
          <input
            type="date"
            className="input"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
          />
        </label>

        <div className="md:col-span-2 flex items-center gap-2">
          <button type="submit" className="btn-primary text-sm" disabled={loading || !apiKey}>
            {loading ? 'Requête en cours...' : 'Lancer la requête'}
          </button>
          {!apiKey && <span className="text-xs text-orange-600">Ajoutez d&apos;abord votre Developer API Key.</span>}
        </div>
      </form>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">cURL générée</p>
        <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-48">{curlPreview}</pre>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Résultat JSON</p>
            <span className="badge-soft">
              {result.data.length} ligne{result.data.length > 1 ? 's' : ''}
            </span>
          </div>
          <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}

