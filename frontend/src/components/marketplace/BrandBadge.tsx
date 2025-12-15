export default function BrandBadge({ brand }: { brand: string }) {
  return (
    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
      {brand}
    </span>
  );
}

