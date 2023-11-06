import type { AWS } from '@serverless/typescript';
import * as dotenv from 'dotenv';

import { importFileParser, importProductsFile } from '@functions/index';

dotenv.config();

const { REGION, BUCKET, KEY, PARSED_KEY, SQS_URL } = process.env;

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['s3:ListBucket'],
            Resource: [`arn:aws:s3:::${BUCKET}`]
          },
          {
            Effect: 'Allow',
            Action: ['s3:*'],
            Resource: [`arn:aws:s3:::${BUCKET}/*`]
          },
          {
            Effect: 'Allow',
            Action: [
              'sqs:DeleteMessage',
              'sqs:GetQueueAttributes',
              'sqs:ReceiveMessage',
              'sqs:SendMessage',
            ],
            Resource: [`arn:aws:sqs:${REGION}:109193798746:catalog-items-queue`]
          }
        ]
      }
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      REGION,
      BUCKET,
      KEY,
      PARSED_KEY,
      SQS_URL
    },
    stage: 'dev',
    region: 'eu-west-1',
  },
  resources: {
    Resources: {
      GatewayErrorResponse: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Request-Headers': "'Authorization'",
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },
    },
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    authorizers: {
      basicAuthorizer: {
        name: 'basicAuthorizer',
        arn: 'arn:aws:lambda:${aws:region}:${aws:accountId}:function:authorization-service-dev-basicAuthorizer',
        type: 'token',
      },
    },
  },
};

module.exports = serverlessConfiguration;
