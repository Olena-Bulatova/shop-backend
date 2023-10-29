import { handlerPath } from '@libs/handler-resolver';
import * as dotenv from 'dotenv';

dotenv.config();

const { BUCKET, KEY } = process.env;

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: BUCKET,
        event: 's3:ObjectCreated:*',
        rules: [
          {
            prefix: KEY + '/'
          }
        ],
        existing: true
      },
    },
  ],
};
