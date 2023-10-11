import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { ErrorMessages, ErrorName, StatusCode } from '../../constants/http';
import { HttpErrorResponse } from '../../errors/http-error-response';
import { Product } from '../../types/products';
import { getProductsById } from '../../utils/products';

const getProductsByIdHandler: ValidatedEventAPIGatewayProxyEvent<null> = async (event) => {
  try {
    const { id } = event.pathParameters;

    if (!id) {
      throw new HttpErrorResponse(StatusCode.BAD_REQUEST, ErrorName.BAD_REQUEST, ErrorMessages.invalidId);
    }

    const product = await getProductsById(id);

    if (!product) {
      throw new HttpErrorResponse(StatusCode.NOT_FOUND, ErrorName.NOT_FOUND, ErrorMessages.productNotFound(id));
    }

    return formatJSONResponse<{ product: Product }>(StatusCode.SUCCESS, { product });
  } catch (error) {
    const errorResponse = error?.statusCode ? error : new HttpErrorResponse();

    return formatJSONResponse<HttpErrorResponse>(errorResponse.statusCode, errorResponse);
  }
};

export const main = getProductsByIdHandler;

