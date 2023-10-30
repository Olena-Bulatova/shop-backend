
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { SQS } from 'aws-sdk';
import { ImportFileBucketParams } from '../interfaces/import';
import csv from 'csv-parser';
import stripBom from 'strip-bom-stream';

const moveParsedFiles = async (client: S3Client, { bucket, key, destinationKey }: ImportFileBucketParams) => {
  const sourcePrefix = key.split('/')[0];
  const Key = key.replace(sourcePrefix, destinationKey);
  const copyCommand = new CopyObjectCommand({ Bucket: bucket, CopySource: `${bucket}/${key}`, Key });
  const deleteCommand = new DeleteObjectCommand({ Bucket: bucket, Key: key });

  await client.send(copyCommand);
  await client.send(deleteCommand);
};

const sendMessageToSQS = ({ region }: ImportFileBucketParams, data: unknown) => {
  const sqs = new SQS({ region });

  sqs.sendMessage({
    QueueUrl: process.env.SQS_URL,
    MessageBody: JSON.stringify(data)
  }, (error, data) => {
    if (error) {
      console.log('error: ', error);
      throw error;
    }

    console.log('data: ', data);
  }
  );
}

const mapValues = ({ header, index, value }) => {
  switch (header) {
    case 'count':
    case 'price':
      return Number(value);
    default:
      return value;
  }
};

const parseCsvFile = (client: S3Client, params: ImportFileBucketParams, uploadedData: GetObjectCommandOutput) => {
  return new Promise((resolve, reject) => {
    uploadedData.Body
      .pipe(stripBom())
      .pipe(csv({ mapValues }))
      .on('data', data => sendMessageToSQS(params, data))
      .on('end', async () => {
        await moveParsedFiles(client, params);
        return resolve('Success');
      })
      .on('error', (error) => {
        console.log(error);
        return reject(error);
      });
  });
}

export const parseBucketFiles = async (params: ImportFileBucketParams): Promise<unknown> => {
  const { bucket, key, region } = params;

  const client = new S3Client({ region });
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });

  const uploadedData = await client.send(command);

  return parseCsvFile(client, params, uploadedData)
};