import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import logger from './util/logger';

if (fs.existsSync('.env')) {
  logger.debug('Using .env file to supply config environment variables');
  dotenv.config({ path: '.env' });
} else {
  logger.debug(
    'Using .env.example file to supply config environment variables',
  );
  dotenv.config({ path: '.env.example' });
}

export const ENVIRONMENT = process.env.NODE_ENV;

export const MESSY_PATH = path.resolve(process.env.HOME, '.messy');
export const APPSTATE_FILE_PATH = path.resolve(MESSY_PATH, 'tmp/appstate.json');
