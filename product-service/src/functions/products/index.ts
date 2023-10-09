import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'products',
        cors: true,
        responseData: {
          200: {
            description: 'Products array',
            bodyType: 'ProductList',
          },
          500: {
            description: 'Internal server error',
          }
        }
      },
    },
  ],
};
