import path from 'path';

export const MESSY_PATH = path.resolve(process.env.HOME, '.messy');
export const APPSTATE_FILE_PATH = path.resolve(MESSY_PATH, 'tmp/appstate.json');
