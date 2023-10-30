import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getProductsByIdHandler } from './handler';
import * as productsActions from '../../utils/products';
import * as apiGateway from '@libs/api-gateway';
import { ErrorMessages, ErrorName, StatusCode } from 'src/constants/http';
import { HttpErrorResponse } from '../../validations/http-error-response';

const event: APIGatewayProxyEvent = {
  headers: {
    'Content-Type': 'application/json'
  },
  pathParameters: {
    id: '354912'
  }
} as any;

describe('getProductsByIdHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return products by id', async () => {
    const product = {
      "count": 12,
      "description": "Despite his family’s baffling generations-old ban on music, Miguel dreams of becoming an accomplished musician like his idol, Ernesto de la Cruz. Desperate to prove his talent, Miguel finds himself in the stunning and colorful Land of the Dead following a mysterious chain of events. Along the way, he meets charming trickster Hector, and together, they set off on an extraordinary journey to unlock the real story behind Miguel's family history.",
      "id": "354912",
      "price": 50.9,
      "title": "Coco",
      "posterPath": "/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg"
    };
    jest.spyOn(productsActions, 'getProductsById').mockResolvedValueOnce(product);
    const result = await getProductsByIdHandler(event as any, this, () => { }) as APIGatewayProxyResult;

    expect(result.statusCode).toEqual(StatusCode.SUCCESS);
    expect(result.body).toEqual(JSON.stringify({ product }));
  });

  test('should call getProductsById', async () => {
    const spy = jest.spyOn(productsActions, 'getProductsById');
    await getProductsByIdHandler(event as any, this, () => { }) as APIGatewayProxyResult;

    expect(spy).toHaveBeenCalledWith(event.pathParameters.id);
  });

  test('should call formatJSONResponse with error if id is not defined', async () => {
    const spy = jest.spyOn(apiGateway, 'formatJSONResponse');
    const error = new HttpErrorResponse(StatusCode.BAD_REQUEST, ErrorName.BAD_REQUEST, ErrorMessages.invalidId)
    await getProductsByIdHandler({ ...event, pathParameters: {} } as any, this, () => { }) as APIGatewayProxyResult;

    expect(spy).toHaveBeenCalledWith(StatusCode.BAD_REQUEST, error);
  });

  test('should call formatJSONResponse with error if product not found', async () => {
    jest.spyOn(productsActions, 'getProductsById').mockResolvedValueOnce(null);
    const spy = jest.spyOn(apiGateway, 'formatJSONResponse');
    const id = '1111';
    const error = new HttpErrorResponse(StatusCode.NOT_FOUND, ErrorName.NOT_FOUND, ErrorMessages.productNotFound(id));
    await getProductsByIdHandler({ ...event, pathParameters: { id } } as any, this, () => { }) as APIGatewayProxyResult;

    expect(spy).toHaveBeenCalledWith(StatusCode.NOT_FOUND, error);
  });

  test('should call formatJSONResponse with error', async () => {
    jest.spyOn(productsActions, 'getProductsById').mockRejectedValueOnce(new Error('Error'));
    const spy = jest.spyOn(apiGateway, 'formatJSONResponse');
    await getProductsByIdHandler(event as any, this, () => { }) as APIGatewayProxyResult;
    const error = new HttpErrorResponse();

    expect(spy).toHaveBeenCalledWith(StatusCode.INTERNAL_SERVER, error);
  });
});

