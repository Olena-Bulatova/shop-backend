import { Product } from '../types/products';
import productList from '../collections/products.json';

export const getProducts = (): Product[] => {
  return productList;
}

export const getProductsById = (id: string): Product => {
  const products = getProducts();

  return products?.find((product) => product.id === id);
};
