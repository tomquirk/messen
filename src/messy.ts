import facebook, { FacebookError } from 'facebook-chat-api';
import fs from 'fs';

import * as settings from './settings';

import * as helpers from './util/helpers';
import logger from './util/logger';

function fetchUserInfo(
  api: facebook.API,
  userId: string,
): Promise<facebook.FacebookUser> {
  return new Promise((resolve, reject) => {
    return api.getUserInfo(
      userId,
      (err: FacebookError, data: { [key: string]: facebook.FacebookUser }) => {
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
  payload: facebook.Credentials | { appState: facebook.AppState },
  config: facebook.APIconfig,
  getMfaCode: () => Promise<string>,
): Promise<facebook.API> {
  return new Promise((resolve, reject) => {
    return facebook(payload, config, (err, api) => {
      if (err) {
        switch (err.error) {
          case 'login-approval':
            return getMfaCode().then((code: string) => {
              logger.debug('MFA code: ' + code);
              return err.continue(code);
            });
          default:
            return reject(Error(`Failed to login: ${err.error}`));
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

  login(credentials: facebook.Credentials): Promise<any> {
    const apiConfig = {
      forceLogin: true,
      logLevel: this.options.debug ? 'info' : 'silent',
      selfListen: true,
      listenEvents: true,
    };

    return helpers
      .loadAppState(settings.APPSTATE_FILE_PATH)
      .then(appState => {
        logger.debug('Appstate loaded successfully');
        return { appState };
      })
      .catch(() => {
        logger.debug(
          'Appstate not found. Falling back to provided credentials',
        );

        return credentials;
      })
      .then(payload => {
        return getApi(payload, apiConfig, this.getMfaCode);
      })
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

        return fetchUserInfo(this.api, this.api.getCurrentUserID());
      })
      .then(user => {
        this.user = user;
      });
  }

  listen(callback: (err: FacebookError, event: any) => any) {
    return this.api.listen(callback);
  }

  logout() {
    fs.unlink(settings.APPSTATE_FILE_PATH, () => {
      process.exit();
    });
  }
}

export = Messy;
