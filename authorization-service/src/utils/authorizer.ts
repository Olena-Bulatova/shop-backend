import { APIGatewayAuthorizerResult } from 'aws-lambda';
import { ParsedToken, PolicyEffect } from '../interfaces/policy';

export const generatePolicy = (principalId: string, effect: PolicyEffect, resource: string): APIGatewayAuthorizerResult => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }]
    }
  }
}

export const parseToken = (tokenCredentials: string): ParsedToken => {
  const parsedToken = Buffer.from(tokenCredentials, 'base64').toString('utf-8').split('=');

  return {
    login: parsedToken[0],
    password: parsedToken[1]
  }
}