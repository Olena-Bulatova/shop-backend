export interface Product {
  count: number;
  description: string;
  id: string;
  price: number;
  title: string;
  posterPath: string;
}

export type ProductList = Product[];
