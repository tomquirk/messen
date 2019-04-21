import facebook, { FacebookError } from 'facebook-chat-api';
import * as settings from './settings';

import getLogger from './util/logger';

const logger = getLogger('api');

if (settings.ENVIRONMENT !== 'production') {
  logger.info('Logging initialized at debug level');
}

function fetchUserInfo(
  api: facebook.API,
  userId: string,
): Promise<facebook.FacebookUser> {
  return new Promise((resolve, reject) => {
    return api.getUserInfo(
      userId,
      (err, data: { [key: string]: facebook.FacebookUser }) => {
        if (err) return reject(Error(err.error));

        const user = data[userId];
        user.id = userId;

        return resolve(user);
      },
    );
  });
}

function fetchUserInfoBatch(
  api: facebook.API,
  userIds: Array<string>,
): Promise<Array<facebook.FacebookUser>> {
  return new Promise((resolve, reject) => {
    return api.getUserInfo(
      userIds,
      (err, data: { [key: string]: facebook.FacebookUser }) => {
        if (err) return reject(Error(err.error));

        const users = Object.keys(data).map(k => {
          return Object.assign(data[k], { id: k })
        })

        return resolve(users);
      },
    );
  });
}

function fetchApiUserFriends(
  api: facebook.API,
): Promise<Array<facebook.FacebookFriend>> {
  return new Promise((resolve, reject) => {
    return api.getFriendsList((err, data: any) => {
      if (err) return reject(Error(err.error));

      return resolve(data);
    });
  });
}

function fetchThreadInfo(
  api: facebook.API,
  threadId: string
): Promise<facebook.FacebookThread> {
  return new Promise((resolve, reject) => {
    return api.getThreadInfo(threadId, (err, data: any) => {
      if (err) return reject(Error(err.error));

      return resolve(data);
    });
  });
}

function fetchThreads(
  api: facebook.API,
  limit: number,
  timestamp?: string,
  tags?: facebook.ThreadListTagQuery
): Promise<Array<facebook.FacebookThread>> {
  return new Promise((resolve, reject) => {
    return api.getThreadList(limit, timestamp, tags || [], (err: FacebookError | undefined, data: any) => {
      if (err) return reject(Error(err.error));
      return resolve(data);
    });
  });
}

function logout(
  api: facebook.API
): Promise<void> {
  return new Promise((resolve, reject) => {
    return api.logout((err) => {
      if (err) return reject(Error(err.error));

      return resolve();
    });
  })
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
              if (err.continue) {
                return err.continue(code);
              }

              return reject(Error(`Failed to login: we couldnt send your MFA code`))
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

export default {
  getApi,
  fetchApiUserFriends,
  fetchUserInfo,
  fetchUserInfoBatch,
  fetchThreadInfo,
  fetchThreads,
  logout
};
