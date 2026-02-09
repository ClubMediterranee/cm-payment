import dotenvExpand from 'dotenv-expand';
import dotenv from 'dotenv-flow';

dotenvExpand.expand(dotenv.config());

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

export const isProduction = process.env.NODE_ENV === 'production';
