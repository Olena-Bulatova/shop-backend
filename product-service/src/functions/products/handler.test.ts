import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getProductsHandler } from './handler';
import productList from '../../collections/products.json';
import * as productsActions from '../../utils/products';
import * as apiGateway from '@libs/api-gateway';
import { StatusCode } from 'src/constants/http';
import { HttpErrorResponse } from '../../validations/http-error-response';

const event: APIGatewayProxyEvent = {
  headers: {
    'Content-Type': 'application/json'
  }
} as any;

describe('getProductsHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return list of products', async () => {
    jest.spyOn(productsActions, 'getProducts').mockResolvedValueOnce(productList);
    const result = await getProductsHandler(event as any, this, () => { }) as APIGatewayProxyResult;

    expect(result.statusCode).toEqual(StatusCode.SUCCESS);
    expect(result.body).toEqual(JSON.stringify(productList));
  });

  test('should call getProducts', async () => {
    const spy = jest.spyOn(productsActions, 'getProducts');
    await getProductsHandler(event as any, this, () => { }) as APIGatewayProxyResult;

    expect(spy).toHaveBeenCalled();
  });

  test('should call formatJSONResponse with product list response', async () => {
    jest.spyOn(productsActions, 'getProducts').mockResolvedValueOnce(productList);
    const spy = jest.spyOn(apiGateway, 'formatJSONResponse');
    await getProductsHandler(event as any, this, () => { }) as APIGatewayProxyResult;

    expect(spy).toHaveBeenCalledWith(StatusCode.SUCCESS, productList);
  });

  test('should call formatJSONResponse with error', async () => {
    jest.spyOn(productsActions, 'getProducts').mockImplementationOnce(() => { throw new Error('Error') });
    const spy = jest.spyOn(apiGateway, 'formatJSONResponse');
    await getProductsHandler(event as any, this, () => { }) as APIGatewayProxyResult;
    const error = new HttpErrorResponse();

    expect(spy).toHaveBeenCalledWith(StatusCode.INTERNAL_SERVER, error);
  });
});

