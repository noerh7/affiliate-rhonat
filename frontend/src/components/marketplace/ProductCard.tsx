import { Link } from 'react-router-dom';
import BrandBadge from './BrandBadge';

export default function ProductCard({ product }: { product: any }) {
  return (
    <Link
      to={`/products/${product.product_id}`}
      className="card p-5 block hover:shadow-xl transition h-full"
    >
      <BrandBadge brand={product.brand_name} />
      <h2 className="text-lg font-semibold mt-3">{product.name}</h2>
      <p className="text-gray-700 font-medium">{product.price}€</p>
      <p className="text-sm text-gray-500">Commission {product.commission_percent}%</p>
      <p className="text-sm mt-2 text-gray-600">Gravité : {product.gravity_score}</p>
    </Link>
  );
}
