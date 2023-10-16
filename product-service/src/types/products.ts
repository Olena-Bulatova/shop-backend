export interface ProductInfo {
  count: number;
  description: string;
  price: number;
  title: string;
  posterPath?: string;
}

export interface Product {
  id: string;
  count: number;
  description: string;
  price: number;
  title: string;
  posterPath?: string;
}

export type ProductList = Product[];
