import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { importProductsFile } from './handler';
import * as process from 'process';
import * as presignedUrl from '../../utils/signed-url';
import * as dotenv from 'dotenv';
import * as apiGateway from '@libs/api-gateway';
import { ErrorMessages, ErrorName, StatusCode } from '../../constants/http';
import { HttpErrorResponse } from '../../validations/http-error-response';

dotenv.config();

const event: APIGatewayProxyEvent = {
  requestContext: {
    path: 'imports',
    httpMethod: 'GET',
    accountId: 'test'
  },
  headers: {
    'Content-Type': 'application/json'
  },
  queryStringParameters: {
    fileName: 'test-products.csv'
  }
} as any;


describe('importProductsFile', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.BUCKET = 'bucket';
    process.env.REGION = 'eu-west-1';
    process.env.KEY = 'uploaded';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return Signed Url and return status code 200', async () => {
    const response = await importProductsFile(event as any, this, () => { }) as APIGatewayProxyResult;
    expect(response.body).toMatch(/https:\/\/bucket.s3.eu-west-1.amazonaws.com\/uploaded\/test-products.csv*/);
    expect(response.statusCode).toEqual(200);
  });

  test('should call formatJSONResponse Signed Url', async () => {
    const signedUrl = 'test';
    jest.spyOn(presignedUrl, 'createPresignedUrl').mockReturnValueOnce(Promise.resolve(signedUrl));
    const spy = jest.spyOn(apiGateway, 'formatJSONResponse');
    await importProductsFile(event as any, this, () => { }) as APIGatewayProxyResult;

    expect(spy).toHaveBeenCalledWith(StatusCode.SUCCESS, signedUrl);
  });

  test('should call formatJSONResponse with INTERNAL_SERVER error', async () => {
    jest.spyOn(presignedUrl, 'createPresignedUrl').mockReturnValueOnce(Promise.reject('Error'));
    const spy = jest.spyOn(apiGateway, 'formatJSONResponse');
    await importProductsFile(event as any, this, () => { }) as APIGatewayProxyResult;
    const error = new HttpErrorResponse();

    expect(spy).toHaveBeenCalledWith(StatusCode.INTERNAL_SERVER, error);
  });

  test('should call formatJSONResponse with BAD_REQUEST error', async () => {
    const spy = jest.spyOn(apiGateway, 'formatJSONResponse');
    await importProductsFile({ ...event, queryStringParameters: {} } as any, this, () => { }) as APIGatewayProxyResult;
    const error = new HttpErrorResponse(StatusCode.BAD_REQUEST, ErrorName.BAD_REQUEST, ErrorMessages.InvalidFileName);

    expect(spy).toHaveBeenCalledWith(StatusCode.BAD_REQUEST, error);
  });
});

