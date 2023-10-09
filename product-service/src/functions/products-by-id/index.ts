import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'products/{id}',
        cors: true,
        responseData: {
          200: {
            description: 'Product object',
            bodyType: 'Product',
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
