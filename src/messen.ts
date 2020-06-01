import facebook from 'facebook-chat-api';

import * as settings from './settings';

import { ThreadStore } from './store/threads'
import { UserStore } from './store/users';

import * as helpers from './util/helpers';
import getLogger from './util/logger';
import api from './api';

type MessenOptionsRequest = {
  dir?: string;
  appstateFilePath?: string
  debug?: boolean
}

type MessenOptions = {
  dir: string;
  appstateFilePath: string
  debug?: boolean
}


const logger = getLogger('messen');
if (settings.ENVIRONMENT !== 'production') {
  logger.info('Logging initialized at debug level');
}

const getAuth = async (
  appstateFilePath: string,
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

  try {
    const appState = await helpers
      .loadAppState(appstateFilePath);
    logger.debug('Appstate loaded successfully');
    return { appState };
  }
  catch (e) {
    logger.debug('Appstate not found. Falling back to provided credentials');
    return useCredentials();
  }
};

const DEFAULT_OPTIONS = {
  dir: settings.MESSEN_PATH,
  debug: false
}

export class Messen {
  api!: facebook.API;
  state: {
    authenticated: boolean;
  };
  store!: {
    threads: ThreadStore,
    users: UserStore,
  }
  options: MessenOptions

  constructor(optionsRequest: MessenOptionsRequest = {}) {
    // correct any user-defined backslash
    if (optionsRequest.dir && optionsRequest.dir[optionsRequest.dir.length - 1] === '/') {
      optionsRequest.dir = optionsRequest.dir.slice(0, optionsRequest.dir.length - 1)
    }

    if (!optionsRequest.dir) {
      optionsRequest.dir = DEFAULT_OPTIONS.dir
    }

    this.options = {
      dir: optionsRequest.dir || DEFAULT_OPTIONS.dir,
      appstateFilePath: `${optionsRequest.dir}/tmp/appstate.json`
    }

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

  async login(
    credentials?: facebook.Credentials,
    useCache: boolean = true,
  ): Promise<void> {
    const apiConfig = {
      forceLogin: true,
      logLevel: this.options.debug ? 'info' : 'silent',
      selfListen: true,
      listenEvents: true,
    };
    const authPayload = await getAuth(this.options.appstateFilePath, this.promptCredentials, credentials, useCache);
    this.api = await api.getApi(authPayload, apiConfig, this.getMfaCode);
    await helpers.saveAppState(this.api.getAppState(), this.options.appstateFilePath);
    logger.debug('App state saved');
    this.state.authenticated = true;

    this.store = {
      threads: new ThreadStore(this.api),
      users: new UserStore(this.api)
    }

    await Promise.all([
      this.store.threads.refresh(),
      this.store.users.refresh()
    ]);
  }

  onMessage(ev: facebook.MessageEvent): void | Error {
    return Error('onMessage not implemented');
  }

  onThreadEvent(ev: facebook.EventEvent): void | Error {
    return Error('onThreadEvent not implemented');
  }

  listen(): void {
    this.api.listenMqtt((err, ev) => {
      if (err) {
        return logger.info(err.error);
      }

      // inject thread data in to event
      return this.store.threads.getThread({ id: ev.threadID }).then(thread => {
        const messenEvent = Object.assign(ev, {
          thread
        })

        switch (messenEvent.type) {
          case 'message':
            return this.onMessage(messenEvent);
          case 'event':
            return this.onThreadEvent(messenEvent);
        }
      })
    });
  }

  async logout(): Promise<void> {
    await Promise.all([
      this.api ? api.logout(this.api) : Promise.resolve(),
      helpers.clearAppState(this.options.appstateFilePath)
    ])

    this.state.authenticated = false;
  }
}
