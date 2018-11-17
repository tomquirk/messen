export = Facebook;

declare function Facebook(
  credentials: Facebook.Credentials,
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
    continue: (val: string) => any;
  }

  export interface FacebookUser {
    id: number;
  }

  export interface APIconfig {
    forceLogin: boolean;
    logLevel: string;
    selfListen: boolean;
    listenEvents: boolean;
  }

  export class API {
    getCurrentUserID(): number;
    getAppState(): AppState;
    getUserInfo(
      userId: number,
      callback: (err: Facebook.FacebookError, api: any) => any,
    ): any;
  }
}
