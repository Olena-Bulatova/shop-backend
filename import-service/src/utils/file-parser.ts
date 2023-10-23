
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { ImportFileBucketParams } from '../interfaces/import';
import csv from 'csv-parser';

const moveParsedFiles = async (client: S3Client, { bucket, key, destinationKey }: ImportFileBucketParams) => {
  const sourcePrefix = key.split('/')[0];
  const Key = key.replace(sourcePrefix, destinationKey);
  const copyCommand = new CopyObjectCommand({ Bucket: bucket, CopySource: `${bucket}/${key}`, Key });
  const deleteCommand = new DeleteObjectCommand({ Bucket: bucket, Key: key });

  await client.send(copyCommand);
  await client.send(deleteCommand);
};

const parseCsvFile = (client: S3Client, params: ImportFileBucketParams, uploadedData: GetObjectCommandOutput) => {
  return new Promise((resolve, reject) => {
    uploadedData.Body
      .pipe(csv())
      .on('data', data => console.log(data))
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

export const parseBucketFiles = async (region: string, params: ImportFileBucketParams): Promise<unknown> => {
  const { bucket, key } = params;

  const client = new S3Client({ region });
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });

  const uploadedData = await client.send(command);

  return parseCsvFile(client, params, uploadedData)
};