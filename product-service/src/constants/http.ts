export const headers = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,GET',
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

export const ErrorMessages = {
  invalidId: 'Invalid ID parameter',
  internalServerError: 'Internal server error',
  productNotFound: (id) => `Product with id = ${id} is not found`
}
