import facebook from 'facebook-chat-api';
import api from '../api';

type ThreadQuery = {
  id?: string
  name?: string
}

const THREAD_QUERY_COUNT = 20

export class ThreadStore {
  _threads: {
    [id: string]: facebook.FacebookThread
  }
  _threadNameToId: {
    [name: string]: string
  }
  _api: facebook.API
  _friends: Array<facebook.FacebookFriend>

  constructor(api: facebook.API, friends: Array<facebook.FacebookFriend>
  ) {
    this._api = api;
    this._friends = friends;
    this._threads = {}
    this._threadNameToId = {}
  }

  _upsertThread(thread: facebook.FacebookThread): void {
    this._threads[thread.threadID] = thread
    this._threadNameToId[thread.name] = thread.threadID
  }

  _getThreadById(id: string): facebook.FacebookThread | undefined {
    return this._threads[id]
  }

  _getThreadByName(nameQuery: string): facebook.FacebookThread | undefined {
    let threadId = this._threadNameToId[nameQuery]
    if (!threadId) {
      const threadName = Object.keys(this._threadNameToId).find(name =>
        name.toLowerCase().startsWith(nameQuery.toLowerCase()),
      );
      threadId = this._threadNameToId[threadName]
    }

    if (!threadId) return null

    return this._threads[threadId]
  }

  _getFriendAsThread(nameQuery: string): facebook.BaseFacebookThread | undefined {
    const friend = this._friends.find(friend =>
      friend.fullName.toLowerCase().startsWith(nameQuery.toLowerCase()),
    );

    if (!friend) return

    return {
      threadID: friend.userID
    }
  }

  async _refreshThread(id: string): Promise<facebook.FacebookThread> {
    const thread = await api.fetchThreadInfo(this._api, id);
    // add thread to store
    this._upsertThread(thread);
    return thread;
  }

  async refresh() {
    const threads = await api.fetchThreads(this._api, THREAD_QUERY_COUNT);
    console.log(`got ${threads.length} threads`)
    threads.forEach(thread => {
      this._upsertThread(thread);
    });
  }

  async getThread(query: ThreadQuery): Promise<facebook.BaseFacebookThread> {
    let thread = undefined;
    const { name, id } = query

    // look for ID, then for name, then check friends list
    if (id) {
      thread = this._getThreadById(id)
    } else if (name) {
      thread = this._getThreadByName(name)
    } else {
      return Promise.reject('Invalid params')
    }
    if (thread) return Promise.resolve(thread)

    thread = this._getFriendAsThread(name)
    if (thread) return Promise.resolve(thread)

    if (!id) return Promise.reject('Invalid params')

    return await this._refreshThread(id)
  }
}