const API = import.meta.env.VITE_API_URL ?? '';

export type StoreProduct = {
  id: number;
  name: string;
  category: string;
  tag: string;
  unit: string;
  description: string;
  badge: string | null;
  rating: number;
  reviews: number;
  in_stock: boolean;
  featured: boolean;
  images: string[];
};

export async function fetchStoreProducts(): Promise<StoreProduct[]> {
  const response = await fetch(`${API}/api/store/products`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Unable to load store products');
  }
  return Array.isArray(payload.data) ? payload.data : [];
}