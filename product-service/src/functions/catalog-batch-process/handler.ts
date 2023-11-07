import { SQSEvent, SQSHandler } from 'aws-lambda';
import { ProductInfo } from '../../types/products';
import { productQuerySchema } from '../../validations/schema';
import { createBatchProducts, notifyAboutCreation } from '../../utils/products';
import { VALIDATE_PRODUCTS_ERROR } from '../../constants/messages';

export const catalogBatchProcess: SQSHandler = async (event: SQSEvent) => {
  try {
    const products = event.Records?.reduce((acc, record) => {
      const productInfo = JSON.parse(record.body);
      const validationErrors = productQuerySchema.validate(productInfo)?.error;

      if (!productInfo || validationErrors) {
        return acc;
      }

      return [...acc, productInfo];
    }, [] as ProductInfo[]);

    if(!products.length) {
      throw VALIDATE_PRODUCTS_ERROR;
    }
    console.log('products to create: ', products);

    await createBatchProducts(products);
    await notifyAboutCreation(process.env.REGION, products);
  } catch (error) {
    console.log('error: ', error);
  }
};

export const main = catalogBatchProcess;
