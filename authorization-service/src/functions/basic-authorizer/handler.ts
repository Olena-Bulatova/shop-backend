import { APIGatewayTokenAuthorizerHandler } from 'aws-lambda';
import { generatePolicy, parseToken } from '../../utils/authorizer';
import { PolicyEffect } from 'src/interfaces/policy';

const basicAuthorizer: APIGatewayTokenAuthorizerHandler = async (event) => {
  console.log('basicAuthorizer event:', event);

  const { authorizationToken, methodArn } = event;
  const { LOGIN, TEST_PASSWORD } = process.env;

  try {
    const tokenCredentials = authorizationToken.split(' ')[1];
    const decodedToken = parseToken(tokenCredentials);

    return LOGIN === decodedToken.login && TEST_PASSWORD === decodedToken.password
      ? generatePolicy(tokenCredentials, PolicyEffect.Allow, methodArn)
      : generatePolicy(tokenCredentials, PolicyEffect.Deny, methodArn);
  } catch (error) {
    return generatePolicy('Unauthorized', PolicyEffect.Deny, event.methodArn);
  }
};

export const main = basicAuthorizer;

