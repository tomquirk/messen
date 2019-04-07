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

  export type FacebookThread = {
    threadID: string,
    participantIDs: Array<string>,
    name: string, // name of thread (usually name of user)
    nicknames: {
      [userID: string]: string
    },
    unreadCount: number,
    messageCount: number,
    imageSrc: string,
    timestamp: string,
    muteUntil: string,
    isGroup: boolean,
    isSubscribed: boolean,
    folder: "inbox" | "archive",
    isArchived: boolean,
    cannotReplyReason: string,
    lastReadTimestamp: string,
    emoji: {
      emoji: string
    },
    color: string,
    adminIDs: Array<string>
  }

  export interface APIconfig {
    forceLogin: boolean;
    logLevel: string;
    selfListen: boolean;
    listenEvents: boolean;
  }

  export type ThreadListTagQuery = [] | ["INBOX"] | ["ARCHIVED"] | ["PENDING"] | ["OTHER"] |
    ["INBOX", "unread"] | ["ARCHIVED", "unread"] | ["PENDING", "unread"] | ["OTHER", "unread"]

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
    getThreadInfo(
      threadId: string,
      callback: (err: Facebook.FacebookError, data: any) => void,
    ): void;
    getThreadList(
      limit: number,
      timestamp: string,
      tags: ThreadListTagQuery,
      callback: (err: Facebook.FacebookError, data: any) => void
    ): void
  }

  export type APIEvent = MessageEvent | EventEvent

  export type MessageEvent = {
    attachments: Array<any>,
    body: string,
    isGroup: boolean,
    mentions: {
      [id: string]: string
    },
    messageID: string,
    senderID: string,
    threadID: string,
    isUnread: boolean,
    type: "message"
  }

  export type EventEvent = {
    author: string,
    logMessageBody: string,
    logMessageData: string,
    logMessageType: "log:subscribe" | "log:unsubscribe" | "log:thread-name" | "log:thread-color" | "log:thread-icon" | "log:user-nickname",
    threadID: string,
    type: "event"
  }

  // TODO Implement other event types
}
