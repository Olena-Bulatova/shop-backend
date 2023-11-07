import { Product, ProductInfo } from '../types/products';
import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from './db-connect';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_POSTER_PATH } from 'src/constants/poster';
import { TransactWriteItem, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { getStocksByProductId } from './stocks';
import { SNS } from 'aws-sdk';


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

const prepareDataToCreateProduct = ({ count, description, title, price, posterPath }: ProductInfo) => {
  const id = uuidv4();
  const newProduct = { id, title, description, price, poster_path: posterPath || DEFAULT_POSTER_PATH };
  const newStock = { product_id: id, count };
  return [
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
  ];
};

export const sendTransactWriteItemsCommand = async (items: TransactWriteItem[]) => {
  const command = new TransactWriteItemsCommand({ TransactItems: [...items] });

  await docClient.send(command);
};

export const createProduct = async (product: ProductInfo) => {
  const items = prepareDataToCreateProduct(product);
  await sendTransactWriteItemsCommand(items);
};

export const createBatchProducts = async (products: ProductInfo[]) => {
  const items = products.reduce((acc, product) => [...acc, ...prepareDataToCreateProduct(product)], []);
  await sendTransactWriteItemsCommand(items);
};

const getFullProductInfo = async (product) => {
  const stocksCount = await getStocksByProductId(product.id);

  return { ...product, posterPath: product.poster_path, count: stocksCount || 0 };
}

export const notifyAboutCreation = (region: string, products: ProductInfo[]) => {
  const sns = new SNS({ region });

  const publishProducts = products.reduce((acc, product) => {
    const params = {
      Subject: 'Product creation notification',
      Message: `Product ${product.title} is created successfully!`,
      MessageAttributes: {
        price: { DataType: 'Number', StringValue: product.price.toString() },
      },
      TopicArn: process.env.SNS_ARN,
    };

    const publishSns = sns.publish(params, (error, data) => {
      if (error) {
        console.log('error: ', error);
        throw error;
      }
      console.log('data: ', data);
    }).promise()

    return [...acc, publishSns]
  }, []);

  return Promise.all(publishProducts);
}
