/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
const Joi = require('joi');
import { Token } from '../enums/token';
import { Config } from './config';

export const configProvider = {
  provide: Token.CONFIG,
  useFactory: (): Config => {
    const env = process.env;
    const validationSchema = Joi.object().unknown().keys({
      PORT: Joi.string().required(),
      NODE_ENV: Joi.string().required(),
    });

    const result = validationSchema.validate(env);

    if (result.error) {
      throw new Error('Configuration not valid: ' + result.error.message);
    }

    return {
      apiPort: Number.parseInt(env.PORT, 10),
      environment: env.NODE_ENV,
    };
  },
};
