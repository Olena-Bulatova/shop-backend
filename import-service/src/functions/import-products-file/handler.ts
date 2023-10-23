import { formatJSONResponse, type ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { CONTENT_TYPE_CSV, ErrorMessages, ErrorName, StatusCode } from '../../constants/http';
import { HttpErrorResponse } from '../../validations/http-error-response';
import { createPresignedUrl } from '../../utils/signed-url';
import { APIGatewayProxyResult } from 'aws-lambda';

export const importProductsFile: ValidatedEventAPIGatewayProxyEvent<null> = async (event): Promise<APIGatewayProxyResult> => {
  const { REGION, BUCKET, KEY } = process.env;

  try {
    const { fileName } = event.queryStringParameters;

    if (!fileName) {
      throw new HttpErrorResponse(StatusCode.BAD_REQUEST, ErrorName.BAD_REQUEST, ErrorMessages.InvalidFileName);
    }

    const url = await createPresignedUrl(REGION, {
      bucket: BUCKET,
      key: `${KEY}/${fileName}`,
      contentType: CONTENT_TYPE_CSV
    });

    return formatJSONResponse<string>(200, url);
  } catch (error) {
    const errorResponse = error?.statusCode ? error : new HttpErrorResponse();

    return formatJSONResponse<HttpErrorResponse>(errorResponse.statusCode, errorResponse);
  }
};

export const main = middyfy(importProductsFile);
