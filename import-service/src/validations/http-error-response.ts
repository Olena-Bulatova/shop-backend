import { ErrorMessages, ErrorName, StatusCode } from '../constants/http';

export class HttpErrorResponse extends Error {
  statusCode: StatusCode;
  errorName: ErrorName;
  message: string;

  constructor(statusCode = StatusCode.INTERNAL_SERVER, name = ErrorName.INTERNAL_SERVER, message = ErrorMessages.InternalServerError) {
    super();
    this.statusCode = statusCode;
    this.name = name;
    this.message = message;
  }
}
