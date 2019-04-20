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

  constructor(api: facebook.API
  ) {
    this._api = api;
    this._threads = {}
    this._threadNameToId = {}
  }

  _upsertThread(thread: facebook.FacebookThread): void {
    this._threads[thread.threadID] = thread
    // TODO(tom) need to check if threadname is `null`
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

  async _refreshThread(id: string): Promise<facebook.FacebookThread> {
    const thread = await api.fetchThreadInfo(this._api, id);
    // add thread to store
    this._upsertThread(thread);
    return thread;
  }

  async refresh() {
    const threads = await api.fetchThreads(this._api, THREAD_QUERY_COUNT);
    threads.forEach(thread => {
      this._upsertThread(thread);
    });
  }

  async getThread(query: ThreadQuery): Promise<facebook.BaseFacebookThread> {
    let thread = undefined;
    const { name, id } = query
    // look for ID, then for name
    if (id) {
      thread = this._getThreadById(id)
    } else if (name) {
      thread = this._getThreadByName(name)
    }

    if (thread) return Promise.resolve(thread)

    if (!id) return Promise.reject('Invalid params')

    return await this._refreshThread(id)
  }

  getThreadList(limit?: number): Array<facebook.BaseFacebookThread> {
    return Object.values(this._threads).slice(0, limit)
  }
}