const CURL_COMMAND = `curl.exe -X GET "https://api.clickbank.com/rest/1.3/analytics/affiliate/vendor" -H "Authorization: API-KM27URMQL9C2275OIUEIX7FBMX4NHIM6VCHT" -H "Accept: application/json" -d "account=freenzy" -d "startDate=2025-12-01" -d "endDate=2025-12-11" -d "select=HOP_COUNT,SALE_COUNT"`;

const RESPONSE_JSON = {
  rows: { row: null },
  totals: {
    total: [
      { attribute: 'HOP_COUNT', value: { '@type': 'xs:long', $: '0' } },
      { attribute: 'SALE_COUNT', value: { '@type': 'xs:long', $: '0' } },
    ],
  },
};

export default function ClickbankRequestPreview() {
  return (
    <section className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Requête ClickBank (exemple)</h2>
          <p className="text-sm text-gray-600">
            Aperçu d&apos;une requête Analytics et du JSON retourné (fichier clickbankdevelopperkey.md).
          </p>
        </div>
        <span className="badge-soft">Démo</span>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Requête (cURL)</p>
        <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-48">{CURL_COMMAND}</pre>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Réponse JSON</p>
        <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-64">
          {JSON.stringify(RESPONSE_JSON, null, 2)}
        </pre>
      </div>
    </section>
  );
}



