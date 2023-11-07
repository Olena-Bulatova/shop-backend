import { SQSEvent } from 'aws-lambda';
import { catalogBatchProcess } from './handler';
import * as productsActions from '../../utils/products';
import { VALIDATE_PRODUCTS_ERROR } from '../../constants/messages';

const product = {
  count: 2,
  description: 'A team-building conference for municipal employees turns into a nightmare...',
  price: 5.99,
  title: 'Konferensen',
  posterPath: '/uLH5rUkRNwAUt6YqR86f8ewXZEY.jpg'
}
const region = 'eu-west-1';

const event: SQSEvent = {
  Records: [
    {
      body: JSON.stringify(product)
    }
  ]
} as any;

describe('catalogBatchProcess', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.REGION = region;
    process.env.SNS_ARN = `arn:aws:sns:${region}:42142:test-topic`;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should trow error if all records are invalid', async () => {
    const event: SQSEvent = {
      Records: []
    };
    const logSpy = jest.spyOn(global.console, 'log');
    await catalogBatchProcess(event, this, () => { });

    expect(logSpy).toHaveBeenCalledWith('error: ', VALIDATE_PRODUCTS_ERROR);
  });

  test('should call createBatchProducts', async () => {
    jest.spyOn(productsActions, 'notifyAboutCreation').mockResolvedValueOnce({} as any);
    const spy = jest.spyOn(productsActions, 'createBatchProducts').mockResolvedValueOnce();;
    await catalogBatchProcess(event, this, () => { });

    expect(spy).toHaveBeenCalledWith([product]);
  });

  test('should call notifyAboutCreation', async () => {
    jest.spyOn(productsActions, 'createBatchProducts').mockResolvedValueOnce();
    const spy = jest.spyOn(productsActions, 'notifyAboutCreation').mockResolvedValueOnce({} as any);
    await catalogBatchProcess(event, this, () => { });

    expect(spy).toHaveBeenCalledWith(region, [product]);
  });
});
