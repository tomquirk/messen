import facebook from 'facebook-chat-api';
import messen from 'messen';
import fs from 'fs';

import * as settings from './settings';

import * as helpers from './util/helpers';
import getLogger from './util/logger';
import api from './api';

const logger = getLogger('messen');
if (settings.ENVIRONMENT !== 'production') {
  logger.info('Logging initialized at debug level');
}

const getAuth = (
  promptCredentialsFn: () => Promise<facebook.Credentials>,
  credentials?: facebook.Credentials,
  useCache?: boolean,
): Promise<facebook.Credentials | { appState: facebook.AppState }> => {
  const useCredentials = () => {
    if (credentials) {
      return Promise.resolve(credentials);
    }
    return promptCredentialsFn();
  };

  if (!useCache) {
    return useCredentials();
  }

  return helpers
    .loadAppState(settings.APPSTATE_FILE_PATH)
    .then(appState => {
      logger.debug('Appstate loaded successfully');
      return { appState };
    })
    .catch(() => {
      logger.debug('Appstate not found. Falling back to provided credentials');

      return useCredentials();
    });
};

class Messen {
  api: facebook.API;
  user: messen.MessenMeUser;
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

  promptCredentials(): Promise<facebook.Credentials> {
    return Promise.reject(Error('promptCredentials not implemented'));
  }

  login(
    credentials?: facebook.Credentials,
    useCache: boolean = true,
  ): Promise<any> {
    const apiConfig = {
      forceLogin: true,
      logLevel: this.options.debug ? 'info' : 'silent',
      selfListen: true,
      listenEvents: true,
    };

    return getAuth(this.promptCredentials, credentials, useCache)
      .then(authPayload => {
        return api.getApi(authPayload, apiConfig, this.getMfaCode);
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

        return Promise.all([
          api.fetchUserInfo(this.api, this.api.getCurrentUserID()),
          api.fetchApiUserFriends(this.api),
        ]);
      })
      .then(([user, friends]) => {
        this.user = Object.assign(user, { friends });
      });
  }

  onMessage(ev: facebook.APIEvent): any {
    return Promise.reject(Error('onMessage not implemented'));
  }

  onThreadEvent(ev: facebook.APIEvent): any {
    return Promise.reject(Error('onThreadEvent not implemented'));
  }

  listen(): any {
    this.api.listen((err, ev) => {
      if (err) {
        return logger.error(err);
      }

      switch (ev.type) {
        case 'message':
          return this.onMessage(ev);
        case 'event':
          return this.onThreadEvent(ev);
      }
    });
  }

  logout() {
    fs.unlink(settings.APPSTATE_FILE_PATH, () => {
      process.exit();
    });
  }
}

export = Messen;
