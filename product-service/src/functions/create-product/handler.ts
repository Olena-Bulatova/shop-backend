import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { ErrorMessages, ErrorName, StatusCode } from '../../constants/http';
import { productQuerySchema } from '../../validations/schema';
import { HttpErrorResponse, concatJoiErrors } from '../../validations/http-error-response';
import { ProductInfo } from '../../types/products';
import { middyfy } from '@libs/lambda';
import { createProduct } from '../../utils/products';

const createProductsHandler: ValidatedEventAPIGatewayProxyEvent<ProductInfo> = async (event) => {
  console.log('createProductsHandler, event:', event);

  try {
    const productInfo = event.body as ProductInfo;

    if (!productInfo) {
      throw new HttpErrorResponse(StatusCode.BAD_REQUEST, ErrorName.BAD_REQUEST, ErrorMessages.invalidId);
    }

    const validationErrors = productQuerySchema.validate(productInfo)?.error;

    if (validationErrors) {
      throw new HttpErrorResponse(StatusCode.BAD_REQUEST, ErrorName.BAD_REQUEST, concatJoiErrors(validationErrors));
    }

    await createProduct(productInfo);

    return formatJSONResponse<unknown>(StatusCode.SUCCESS, {});
  } catch (error) {
    const errorResponse = error?.statusCode ? error : new HttpErrorResponse();

    return formatJSONResponse<HttpErrorResponse>(errorResponse.statusCode, errorResponse);
  }
};

export const main = middyfy(createProductsHandler);
