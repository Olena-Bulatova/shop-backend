import { ErrorMessages, ErrorName, StatusCode } from '../constants/http';
import { ValidationError } from 'joi';

export class HttpErrorResponse extends Error {
  statusCode: StatusCode;
  errorName: ErrorName;
  message: string;

  constructor(statusCode = StatusCode.INTERNAL_SERVER, name = ErrorName.INTERNAL_SERVER, message = ErrorMessages.internalServerError) {
    super();
    this.statusCode = statusCode;
    this.name = name;
    this.message = message;
  }
}


export const concatJoiErrors = (error: ValidationError): string => {
  return error?.details.map(({ message }) => message).join('; ');
}
