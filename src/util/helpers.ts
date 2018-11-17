import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import facebook from 'facebook-chat-api';

/**
 * Dumps the state of the Facebook API to a file
 * @param {Object} appstate object generated from fbApi.getAppState() method
 * @param {string} filepath file to save appstate to
 * @return {Promise}
 */
export function saveAppState(
  appstate: facebook.AppState,
  filepath: string,
): Promise<facebook.AppState | Error> {
  return new Promise((resolve, reject) =>
    mkdirp(path.dirname(filepath), mkdirpErr => {
      if (mkdirpErr) return reject(mkdirpErr);

      // ...then write the file
      return fs.writeFile(filepath, JSON.stringify(appstate), writeErr => {
        if (writeErr) return reject(writeErr);

        return resolve(appstate);
      });
    }),
  );
}

module.exports = {
  saveAppState,
};
