import path from 'path';
require('dotenv').config();

export const ENVIRONMENT = process.env.NODE_ENV || 'production';

export const MESSEN_PATH = path.resolve(process.env.HOME, '.messen');