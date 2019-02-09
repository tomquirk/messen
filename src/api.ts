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
      (err: FacebookError, data: { [key: string]: facebook.FacebookUser }) => {
        if (err) return reject(Error(err.error));

        const user = data[userId];
        user.id = userId;

        return resolve(user);
      },
    );
  });
}

function fetchApiUserFriends(
  api: facebook.API,
): Promise<Array<facebook.FacebookFriend>> {
  return new Promise((resolve, reject) => {
    return api.getFriendsList((err: FacebookError, data: any) => {
      if (err) return reject(Error(err.error));

      return resolve(data);
    });
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

export default {
  fetchApiUserFriends,
  getApi,
  fetchUserInfo,
};
