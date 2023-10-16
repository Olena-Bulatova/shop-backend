import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'products',
        cors: true,
        responseData: {
          200: {
            description: 'Product crete Success',
          },
          400: {
            description: 'Bad request',
          },
          404: {
            description: 'Product not found',
          },
          500: {
            description: 'Internal server error',
          }
        }
      },
    },
  ],
};
