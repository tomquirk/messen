import facebook from 'facebook-chat-api';
import fs from 'fs';

import * as settings from './settings';

import * as helpers from './util/helpers';

/**
 * Creates a singleton that represents a Messy session.
 * @class
 */
function Messy(options = {}) {
  this.api = null;
  this.user = null;
  this.state = {};
  this.options = options;
}

Messy.prototype.getMfaCode = function getMfaCode() {
  return Promise.reject('getMfaCode not implemented');
};

Messy.prototype.login = function login(credentials: facebook.Credentials) {
  const config = {
    forceLogin: true,
    logLevel: this.options.debug ? 'info' : 'silent',
    selfListen: true,
    listenEvents: true,
  };

  return new Promise((resolve, reject) => {
    facebook(credentials, config, (err, api) => {
      if (err) {
        switch (err.error) {
          case 'login-approval':
            return this.getMfaCode()
              .then((code: string) => {
                return err.continue(code);
              })
              .catch((mfaErr: string) => reject(mfaErr));
          default:
            return reject(
              Error(`Failed to login as [${credentials.email}]: ${err}`),
            );
        }
      }

      if (!api) {
        return reject('api failed to load');
      }

      return helpers
        .saveAppState(api.getAppState(), settings.APPSTATE_FILE_PATH)
        .then(() => {
          this.api = api;
          this.state.authenticated = true;

          return resolve();
        })
        .catch(appstateErr => reject(appstateErr));
    });
  });
};

/**
 * Terminates the Messy session and removes all relevent files.
 */
Messy.prototype.logout = function logout() {
  fs.unlink(settings.APPSTATE_FILE_PATH, () => {
    process.exit();
  });
};

module.exports = Messy;
