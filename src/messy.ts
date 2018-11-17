import facebook from 'facebook-chat-api';
import fs from 'fs';

import * as settings from './settings';

import * as helpers from './util/helpers';
import logger from './util/logger';

class Messy {
  api: any;
  user: any;
  state: any;
  options: any;
  constructor(options: any = {}) {
    this.options = options;
  }

  getMfaCode(): Promise<string | Error> {
    return Promise.reject(Error('getMfaCode not implemented'));
  }

  login(credentials: facebook.Credentials): Promise<any> {
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
                  logger.debug('MFA code: ' + code);
                  return err.continue(code);
                })
                .catch((mfaErr: string) => reject(mfaErr));
            default:
              console.log(err);
              return reject(
                Error(
                  `Failed to login as [${credentials.email}]: ${err.error}`,
                ),
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
  }

  logout() {
    fs.unlink(settings.APPSTATE_FILE_PATH, () => {
      process.exit();
    });
  }
}

export = Messy;
