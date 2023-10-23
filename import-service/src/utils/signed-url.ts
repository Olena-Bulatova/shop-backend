import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ImportFileBucketParams } from '../interfaces/import';

export const createPresignedUrl = (region, { bucket, key, contentType }: ImportFileBucketParams) => {
  const client = new S3Client({ region });
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });

  return getSignedUrl(client, command, { expiresIn: 3600 });
};
