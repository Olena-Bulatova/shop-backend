import { formatJSONResponse } from '@libs/api-gateway';
import { HttpErrorResponse } from '../../validations/http-error-response';
import { parseBucketFiles } from '../../utils/file-parser';
import { S3Event } from 'aws-lambda';

const { REGION, BUCKET, PARSED_KEY } = process.env;

const importFileParser = async (event: S3Event) => {
  try {
    const readFiles = event.Records
      .filter((({ s3 }) => s3.object.size))
      .map(async record => await parseBucketFiles(
        { region: REGION, bucket: BUCKET, key: record.s3.object.key, destinationKey: PARSED_KEY }
      ));

    await Promise.all(readFiles);

    console.log('Files was parsed successfully');

    return formatJSONResponse<string>(200, 'Files was parsed successfully');
  } catch (error) {
    console.log("Error: ", error);
    const errorResponse = error?.statusCode ? error : new HttpErrorResponse();

    return formatJSONResponse<HttpErrorResponse>(errorResponse.statusCode, errorResponse);
  }
};

export const main = importFileParser;
