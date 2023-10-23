export const headers = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
};

export enum StatusCode {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER = 500,
}

export enum ErrorName {
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_SERVER = 'INTERNAL_SERVER',
}

export enum ErrorMessages {
  InvalidFileName = 'Invalid file name',
  InternalServerError = 'Internal server error'
}

export const CONTENT_TYPE_CSV = 'text/csv';
