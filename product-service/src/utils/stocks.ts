import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { docClient } from './db-connect';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const getStocksByProductId = async (productId: string) => {
  const command = new QueryCommand({
    TableName: process.env.STOCKS_TABLE_NAME,
    KeyConditionExpression: 'product_id = :productId',
    ExpressionAttributeValues: { ':productId': { "S": productId } }
  });
  const stocks = (await docClient.send(command))?.Items;

  return unmarshall(stocks[0])?.count;
};