export interface ProductLite {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  price: number; // cents
  currency?: string;
  images: string[];
  stock?: number;
  ratingAvg?: number;
  ratingCount?: number;
}

export interface CartItem {
  productId: ProductLite | string;
  qty: number;
  priceAtAdd: number;
}

export interface OrderLite {
  _id: string;
  items: { title: string; qty: number; price: number }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
}
