import * as joi from 'joi';

export const productQuerySchema = joi.object({
  count: joi.number().required(),
  description: joi.string().required(),
  title: joi.string().required(),
  price: joi.number().required().positive(),
  posterPath: joi.string(),
});
