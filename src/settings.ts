import path from 'path';
require('dotenv').config();

export const ENVIRONMENT = process.env.NODE_ENV || 'production';

export const MESSY_PATH = path.resolve(process.env.HOME, '.messen');
export const APPSTATE_FILE_PATH = path.resolve(MESSY_PATH, 'tmp/appstate.json');
