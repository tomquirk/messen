import path from 'path';
import { homedir } from 'os';

require('dotenv').config();

export const ENVIRONMENT = process.env.NODE_ENV || 'production';

export const MESSEN_PATH = path.resolve(homedir(), '.messen');