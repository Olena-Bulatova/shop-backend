import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'import',
        cors: true,
        authorizer: {
          name: '${self:custom.authorizers.basicAuthorizer.name}',
          arn: '${self:custom.authorizers.basicAuthorizer.arn}',
          type: '${self:custom.authorizers.basicAuthorizer.type}',
          resultTtlInSeconds: 0
      },
      },
    },
  ],
};
