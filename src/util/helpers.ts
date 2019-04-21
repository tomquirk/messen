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
): Promise<facebook.AppState> {
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

export function loadAppState(filepath: string): Promise<facebook.AppState> {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (appStateErr, rawAppState: Buffer) => {
      if (appStateErr) {
        return reject(appStateErr);
      }

      const appState = JSON.parse(rawAppState.toString());

      if (!appState) {
        return reject(Error('App state is empty'));
      }

      return resolve(appState);
    });
  });
}

export function clearAppState(filepath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.unlink(filepath, (err) => {
      if (err) return reject(err)
      return resolve();
    });
  });
}
