import type { AWS } from '@serverless/typescript';
import * as dotenv from 'dotenv';

import { productsById, products, createProduct, catalogBatchProcess } from '@functions/index';

dotenv.config();

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-auto-swagger'],
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
            Action: [
              'dynamodb:DescribeTable',
              'dynamodb:Query',
              'dynamodb:Scan',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem'
            ],
            Resource: [
              'arn:aws:dynamodb:${self:provider.region}:*:table/*'
            ]
          },
          {
            Effect: 'Allow',
            Action: [
              'sqs:DeleteMessage',
              'sqs:GetQueueAttributes',
              'sqs:ReceiveMessage',
            ],
            Resource: { 'Fn::GetAtt': ['SQSQueue', 'Arn'] }
          },
          {
            Effect: 'Allow',
            Action: ['sns:*'],
            Resource: { 'Ref': 'SNSTopic' }
          }
        ]
      }
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      DEFAULT_REGION: process.env.DEFAULT_REGION,
      PRODUCTS_TABLE_NAME: process.env.PRODUCTS_TABLE_NAME,
      STOCKS_TABLE_NAME: process.env.STOCKS_TABLE_NAME,
      SNS_ARN: { 'Ref': 'SNSTopic' }
    },
    stage: 'dev',
    region: 'eu-west-1',
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalog-items-queue'
        }
      },
      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'create-product-topic'
        }
      },
      SNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'kuchynska0101@gmail.com',
          Protocol: 'email',
          TopicArn: { 'Ref': 'SNSTopic' }
        }
      },
      SNSHightPriceSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'bulatova853@gmail.com',
          Protocol: 'email',
          TopicArn: { 'Ref': 'SNSTopic' },
          FilterPolicyScope: 'MessageAttributes',
          FilterPolicy: {
            'price': [{ 'numeric': ['>', 20] }]
          }
        }
      }
    }
  },
  // import the function via paths
  functions: { products, productsById, createProduct, catalogBatchProcess },
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
    autoswagger: {
      typefiles: ['./src/types/products.ts'],
      basePath: '/dev',
      host: '8bi3upmkb5.execute-api.eu-west-1.amazonaws.com'
    },
  },
};

module.exports = serverlessConfiguration;
