import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { StatusCode } from '../../constants/http';
import { getProducts } from '../../utils/products';
import { HttpErrorResponse } from '../../validations/http-error-response';
import { Product } from '../../types/products';
import { middyfy } from '@libs/lambda';

const getProductsHandler: ValidatedEventAPIGatewayProxyEvent<null> = async (event) => {
  console.log('getProductsHandler, event:', event);

  try {
    const products = await getProducts();

    return formatJSONResponse<Product[]>(StatusCode.SUCCESS, products);
  } catch {
    const error = new HttpErrorResponse();

    return formatJSONResponse<HttpErrorResponse>(error.statusCode, error);
  }
};

export const main = middyfy(getProductsHandler);
