import facebook, { FacebookError } from 'facebook-chat-api';
import fs from 'fs';

import * as settings from './settings';

import * as helpers from './util/helpers';
import logger from './util/logger';

function fetchUserInfo(
  api: facebook.API,
  userId: number,
): Promise<facebook.FacebookUser> {
  return new Promise((resolve, reject) => {
    return api.getUserInfo(
      userId,
      (err: FacebookError, data: { [key: number]: facebook.FacebookUser }) => {
        if (err) return reject(Error(err.error));

        logger.debug(data);

        const user = data[userId];
        user.id = userId;

        return resolve(user);
      },
    );
  });
}

function getApi(
  credentials: facebook.Credentials,
  config: facebook.APIconfig,
  getMfaCode: () => Promise<string>,
): Promise<facebook.API> {
  return new Promise((resolve, reject) => {
    return facebook(credentials, config, (err, api) => {
      if (err) {
        switch (err.error) {
          case 'login-approval':
            return getMfaCode().then((code: string) => {
              logger.debug('MFA code: ' + code);
              return err.continue(code);
            });
          default:
            return reject(
              Error(`Failed to login as [${credentials.email}]: ${err.error}`),
            );
        }
      }

      logger.debug('Successfully logged in');

      if (!api) {
        return reject(Error('api failed to load'));
      }

      return resolve(api);
    });
  });
}

class Messy {
  api: facebook.API;
  user: facebook.FacebookUser;
  state: {
    authenticated: boolean;
  };
  options: any;
  constructor(options: any = {}) {
    this.options = options;
    this.state = {
      authenticated: false,
    };
  }

  getMfaCode(): Promise<string> {
    return Promise.reject(Error('getMfaCode not implemented'));
  }

  login(credentials: facebook.Credentials): Promise<any | Error> {
    const config = {
      forceLogin: true,
      logLevel: this.options.debug ? 'info' : 'silent',
      selfListen: true,
      listenEvents: true,
    };

    return getApi(credentials, config, this.getMfaCode)
      .then(api => {
        this.api = api;

        return helpers.saveAppState(
          api.getAppState(),
          settings.APPSTATE_FILE_PATH,
        );
      })
      .then(() => {
        logger.debug('App state saved');

        this.state.authenticated = true;
      });
  }

  logout() {
    fs.unlink(settings.APPSTATE_FILE_PATH, () => {
      process.exit();
    });
  }
}

export = Messy;
