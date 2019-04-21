export = Facebook;

declare function Facebook(
  payload: Facebook.Credentials | { appState: Facebook.AppState },
  options: {
    forceLogin: boolean;
    logLevel: string;
    selfListen: boolean;
    listenEvents: boolean;
  },
  callback: (err: Facebook.FacebookError | undefined, api: any) => any,
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
    gender: string | number; // TODO fix this...
  } & FacebookBaseUser;

  // avoid this type (transform it to a FacebookUser)
  export type FacebookFriend = {
    alternateName: string;
    gender: string;
    userID: string;
    fullName: string;
    profilePicture: string;
    profileUrl: string;
  } & FacebookBaseUser;

  export type BaseFacebookThread = {
    threadID: string
    name: string, // name of thread (usually name of user)
  }

  export type FacebookThread = BaseFacebookThread & {
    participantIDs: Array<string>,
    nicknames: Array<any>,
    unreadCount: number,
    messageCount: number,
    imageSrc: string | null,
    timestamp: string,
    muteUntil: string | null,
    isGroup: boolean,
    isSubscribed: boolean,
    folder: "INBOX" | "ARCHIVE",
    isArchived: boolean,
    cannotReplyReason: string | null,
    lastReadTimestamp: string | null,
    emoji: {
      emoji: string
    } | null,
    color: string | null,
    adminIDs: Array<string>,
    participants: Array<any>,
    customizationEnabled: boolean,
    participantAddMode: string | null,
    montageThread: any,
    reactionsMuteMode: 'REACTIONS_NOT_MUTED',
    mentionsMuteMode: 'MENTIONS_NOT_MUTED',
    snippet: string,
    snippetAttachments: Array<any> | null,
    snippetSender: string,
    lastMessageTimestamp: string,
    threadType: number
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
      callback: (err: Facebook.FacebookError | undefined, event: Facebook.APIEvent) => void,
    ): void;
    getCurrentUserID(): string;
    getAppState(): AppState;
    getUserInfo(
      userId: string | Array<string>,
      callback: (err: Facebook.FacebookError | undefined, data: any) => void,
    ): void;
    getFriendsList(
      callback: (err: Facebook.FacebookError | undefined, data: any) => void,
    ): void;
    getThreadInfo(
      threadId: string,
      callback: (err: Facebook.FacebookError | undefined, data: any) => void,
    ): void;
    getThreadList(
      limit: number,
      timestamp: string | undefined,
      tags: ThreadListTagQuery,
      callback: (err: Facebook.FacebookError | undefined, data: any) => void
    ): void;
    logout(
      callback: (err: Facebook.FacebookError | undefined) => void
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
