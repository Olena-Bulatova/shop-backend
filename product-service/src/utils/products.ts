import { Product, ProductInfo } from '../types/products';
import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from './db-connect';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_POSTER_PATH } from 'src/constants/poster';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { getStocksByProductId } from './stocks';


export const getProducts = async () => {
  const command = new ScanCommand({
    TableName: process.env.PRODUCTS_TABLE_NAME,
  });

  const response = (await docClient.send(command))?.Items as Product[];

  return Promise.all(response.map((product) => getFullProductInfo(product)));
};

export const getProductsById = async (id: string) => {
  const command = new QueryCommand({
    TableName: process.env.PRODUCTS_TABLE_NAME,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: { ':id': id },
  });
  const product = (await docClient.send(command))?.Items[0] as Product;

  return getFullProductInfo(product);
};

export const createProduct = async ({ count, description, title, price, posterPath }: ProductInfo) => {
  const id = uuidv4();
  const newProduct = { id, title, description, price, posterPath: posterPath || DEFAULT_POSTER_PATH };
  const newStock = { product_id: id, count };
  const command = new TransactWriteItemsCommand(
    {
      TransactItems: [
        {
          Put: {
            Item: marshall(newProduct),
            TableName: process.env.PRODUCTS_TABLE_NAME
          }
        },
        {
          Put: {
            Item: marshall(newStock),
            TableName: process.env.STOCKS_TABLE_NAME
          }
        }
      ]
    }
  );

  await docClient.send(command);
};

const getFullProductInfo = async (product) => {
  const stocksCount = await getStocksByProductId(product.id);

  return { ...product, posterPath: product.poster_path, count: stocksCount || 0 };
}
