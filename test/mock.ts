import facebook, { FacebookUser } from 'facebook-chat-api';
import { ThreadStore } from '../src/store/threads'
import { UserStore } from '../src/store/users'
import { facebookFriendToUser } from '../src/util/transformers'

const threads: Array<facebook.FacebookThread> = [
  {
    threadID: '100003961877411',
    name: 'Tom Quirk',
    unreadCount: 2,
    messageCount: 2,
    imageSrc: null,
    emoji: null,
    color: null,
    nicknames: [],
    muteUntil: null,
    participants: [Array],
    adminIDs: [],
    folder: 'INBOX',
    isGroup: false,
    customizationEnabled: true,
    participantAddMode: null,
    montageThread: null,
    reactionsMuteMode: 'REACTIONS_NOT_MUTED',
    mentionsMuteMode: 'MENTIONS_NOT_MUTED',
    isArchived: false,
    isSubscribed: true,
    timestamp: '1555626604953',
    snippet: 'hey man, wassup! 🏑',
    snippetAttachments: null,
    snippetSender: '100003961877411',
    lastMessageTimestamp: '1555626604953',
    lastReadTimestamp: null,
    cannotReplyReason: null,
    participantIDs: ['100003961877411', '100035969370185'],
    threadType: 1,
  }
]

const friends: Array<facebook.FacebookFriend> = [
  {
    alternateName: '',
    firstName: 'Tom',
    gender: 'male_singular',
    userID: '100003961877411',
    isFriend: true,
    fullName: 'Tom Quirk',
    profilePicture:
      'https://scontent.fbne3-1.fna.fbcdn.net/v/t1.0-1/p32x32/26001103_1029478707194182_5247344156421403634_n.jpg?_nc_cat=109&_nc_ht=scontent.fbne3-1.fna&oh=66e2c4298663c85b02af770dd6f4f09e&oe=5D46DF72',
    type: 'friend',
    profileUrl: 'https://www.facebook.com/tom.quirk.100',
    vanity: 'tom.quirk.100',
    isBirthday: false,
  },
  {
    alternateName: '',
    firstName: 'Test',
    gender: 'male_singular',
    userID: '12345',
    isFriend: true,
    fullName: 'Test Friend',
    profilePicture:
      'https://scontent.fbne3-1.fna.fbcdn.net/v/t1.0-1/p32x32/26001103_1029478707194182_5247344156421403634_n.jpg?_nc_cat=109&_nc_ht=scontent.fbne3-1.fna&oh=66e2c4298663c85b02af770dd6f4f09e&oe=5D46DF72',
    type: 'friend',
    profileUrl: 'https://www.facebook.com/tom.quirk.100',
    vanity: 'tom.quirk.100',
    isBirthday: false,
  }
];

const meUser: facebook.FacebookUser = {
  name: 'Tom Tester',
  firstName: 'Tom',
  vanity: 'tom.tester.9843499',
  thumbSrc:
    'https://scontent.fbne3-1.fna.fbcdn.net/v/t1.0-1/p32x32/57485489_100153267860319_454875373524484096_n.jpg?_nc_cat=102&_nc_ht=scontent.fbne3-1.fna&oh=e9ef43da96de57e9e30d095b01cbdd01&oe=5D395DC7',
  profileUrl: 'https://www.facebook.com/tom.tester.9843499',
  gender: 2,
  type: 'user',
  isFriend: false,
  isBirthday: false,
  id: '100035969370185',
};

const _users = friends.map(facebookFriendToUser).reduce((a: { [_: string]: facebook.FacebookUser }, b: facebook.FacebookUser) => {
  a[b.id] = b
  return a
}, {})

const users: { [_: string]: facebook.FacebookUser } = {
  [meUser.id]: meUser,
  ..._users
};

export function getApi(): facebook.API {
  return {
    listen(cb) { },
    getCurrentUserID() {
      return meUser.id;
    },
    getAppState() {
      return []
    },
    logout(cb) {
      return cb(undefined);
    },
    getThreadInfo(threadId: string, cb) {
      return cb(undefined, threads.find(t => t.threadID === threadId));
    },
    getThreadList(limit, timestamp, tags, cb) {
      return cb(undefined, threads);
    },
    getFriendsList(cb) {
      return cb(undefined, friends);
    },
    getUserInfo(userId: string | Array<string>, cb) {
      if (Array.isArray(userId)) {
        return cb(undefined, Object.keys(users).reduce((a: { [_: string]: FacebookUser }, id) => {
          a[id] = users[id]
          return a
        }, {}))
      }
      return cb(undefined, { [userId]: users[userId] });
    },
  };
}

export function getThreadStore() {
  const threadStore = new ThreadStore(getApi())
  threadStore.refresh()
  return threadStore;
}

export function getUserStore() {
  const userStore = new UserStore(getApi())
  userStore.refresh()
  return userStore;
}

// TODO(tom) make a Messen interface
export function getMessen(): any {
  class MockMesser {
    api: facebook.API;
    state: {
      authenticated: boolean;
    };
    store: {
      users: UserStore;
      threads: ThreadStore
    }
    options: any;
    constructor() {
      this.api = getApi();
      this.state = {
        authenticated: false
      };

      this.store = {
        users: new UserStore(this.api),
        threads: new ThreadStore(this.api)
      }
    }

    async login() {
      this.state.authenticated = true

      return await Promise.all([
        this.store.users.refresh(),
        this.store.threads.refresh()
      ])
    }
  }

  return new MockMesser()
}