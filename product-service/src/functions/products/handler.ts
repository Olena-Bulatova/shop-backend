import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { StatusCode } from '../../constants/http';
import { getProducts } from '../../utils/products';
import { HttpErrorResponse } from 'src/errors/http-error-response';
import { Product } from '../../types/products';

const getProductsHandler: ValidatedEventAPIGatewayProxyEvent<null> = async () => {
  try {
    const products = await getProducts();

    return formatJSONResponse<Product[]>(StatusCode.SUCCESS, products);
  } catch {
    const error = new HttpErrorResponse();

    return formatJSONResponse<HttpErrorResponse>(error.statusCode, error);
  }
};

export const main = getProductsHandler;

