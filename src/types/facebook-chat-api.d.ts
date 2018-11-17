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

  export interface FacebookUser {
    id: string;
    name: string;
    firstName: string;
    vanity: string;
    thumbSrc: string;
    profileUrl: string;
    gender: number; // 1 or 2?
    type: string;
    isFriend: boolean;
    isBirthday: boolean;
  }

  export interface APIconfig {
    forceLogin: boolean;
    logLevel: string;
    selfListen: boolean;
    listenEvents: boolean;
  }

  export class API {
    listen(callback: (err: Facebook.FacebookError, event: any) => any): any;
    getCurrentUserID(): string;
    getAppState(): AppState;
    getUserInfo(
      userId: string,
      callback: (err: Facebook.FacebookError, api: any) => any,
    ): any;
  }
}
