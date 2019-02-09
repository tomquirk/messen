export = Facebook;

declare function Facebook(
  payload: Facebook.Credentials | { appState: Facebook.AppState },
  options: {
    forceLogin: boolean;
    logLevel: string;
    selfListen: boolean;
    listenEvents: boolean;
  },
  callback: (err: Facebook.FacebookError, api: any) => any,
): string;

declare namespace Facebook {
  export type Credentials = {
    email: string;
    password: string;
  };

  export type AppState = Array<any>;

  export interface FacebookError {
    error: string;
    continue?: (val: string) => any;
  }

  type FacebookBaseUser = {
    isBirthday: boolean;
    vanity: string;
    isFriend: boolean;
    type: string; // friend | ...
    firstName: string;
  };

  export type FacebookUser = {
    id: string;
    name: string;
    thumbSrc: string;
    profileUrl: string;
  } & FacebookBaseUser;

  export type FacebookFriend = {
    alternateName: string;
    gender: string;
    userID: string;
    fullName: string;
    profilePicture: string;
    profileUrl: string;
  } & FacebookBaseUser;

  export interface APIconfig {
    forceLogin: boolean;
    logLevel: string;
    selfListen: boolean;
    listenEvents: boolean;
  }

  export class API {
    listen(
      callback: (err: Facebook.FacebookError, event: Facebook.APIEvent) => void,
    ): void;
    getCurrentUserID(): string;
    getAppState(): AppState;
    getUserInfo(
      userId: string,
      callback: (err: Facebook.FacebookError, data: any) => void,
    ): void;
    getFriendsList(
      callback: (err: Facebook.FacebookError, data: any) => void,
    ): void;
  }

  export interface APIEvent {
    type: string;
    threadID: string;
  }
}
