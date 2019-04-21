import facebook from 'facebook-chat-api';
import api from '../api';
import { facebookFriendToUser } from '../../src/util/transformers';

type UserQuery = {
  id?: string
  name?: string
}

function notUndefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

export class UserStore {
  _users: {
    [id: string]: facebook.FacebookUser
  }
  _userNameToId: {
    [name: string]: string
  }
  _api: facebook.API
  me!: {
    user: facebook.FacebookUser,
    friends: Array<facebook.FacebookUser>
  }

  constructor(api: facebook.API
  ) {
    this._api = api;
    this._users = {}
    this._userNameToId = {}
  }

  _upsertUser(user: facebook.FacebookUser): void {
    this._users[user.id] = user
    this._userNameToId[user.name] = user.id
  }

  _getUserById(id: string): facebook.FacebookUser | undefined {
    return this._users[id]
  }

  _getUserByName(nameQuery: string): facebook.FacebookUser | null {
    let userId = this._userNameToId[nameQuery]
    if (!userId) {
      const userName = Object.keys(this._userNameToId).find(name =>
        name.toLowerCase().startsWith(nameQuery.toLowerCase()),
      );
      if (!userName) return null

      userId = this._userNameToId[userName]
    }

    if (!userId) return null

    return this._users[userId]
  }

  async _refreshUser(id: string): Promise<facebook.FacebookUser> {
    const user = await api.fetchUserInfo(this._api, id);
    // add user to store
    this._upsertUser(user);
    return user;
  }

  async _refreshMeFriends(): Promise<Array<facebook.FacebookUser>> {
    return api.fetchApiUserFriends(this._api).then(friendsRaw => {
      const friends = friendsRaw.map(f => {
        const user = facebookFriendToUser(f)
        this._upsertUser(user)
        return user
      })

      return friends
    })
  }

  async _refreshMeUser(): Promise<facebook.FacebookUser> {
    return api.fetchUserInfo(this._api, this._api.getCurrentUserID()).then(user => {
      this._upsertUser(user)
      return user
    })
  }

  async refresh() {
    return Promise.all([
      this._refreshMeFriends(),
      this._refreshMeUser()
    ]).then(([friends, user]) => {
      this.me = {
        user,
        friends
      }
    })
  }

  async getUser(query: UserQuery): Promise<facebook.FacebookUser | null> {
    let user = undefined;
    const { name, id } = query
    // look for ID, then for name 
    if (id) {
      user = this._getUserById(id)
    } else if (name) {
      user = this._getUserByName(name)
    }

    if (user) return Promise.resolve(user)

    if (id) {
      return await this._refreshUser(id)
    }

    return Promise.resolve(null)
  }

  async getUsers(userIds: Array<string>): Promise<Array<facebook.FacebookUser | undefined>> {
    const cachedUsers = userIds.map((id) => this._getUserById(id)).filter(x => notUndefined(x)) as facebook.FacebookUser[]
    const missingUserIds = cachedUsers.map((val, i) => {
      if (val) return undefined

      return userIds[i]
    }).filter(x => notUndefined(x)) as string[]

    let fetchedUsers: Array<facebook.FacebookUser> = []

    if (missingUserIds.length > 0) {
      // fetch any users we dont have cached
      const fetchedUsers = await api.fetchUserInfoBatch(this._api, missingUserIds)
      fetchedUsers.forEach((user: facebook.FacebookUser) => {
        this._upsertUser(user)
      })
    }

    const allUsers = [...cachedUsers.filter(Boolean), ...fetchedUsers]

    // return in order asked for
    return userIds.map(id => allUsers.find(user => user.id === id))
  }
}