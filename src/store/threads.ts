import facebook from 'facebook-chat-api';
import api from '../api';
import { sortObjects } from '../util/helpers'

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

  _cleanThread(thread: facebook.FacebookThread): facebook.FacebookThread {
    if (thread.isGroup && thread.name === null) {
      const participantNames = (thread.participants || []).filter(user => user.id !== this._api.getCurrentUserID()).map(user => user.name).join(', ')
      thread.name = `(group) ${participantNames || thread.threadID}`
    }
    return thread
  }

  _upsertThread(thread: facebook.FacebookThread): void {
    const cleanThread = this._cleanThread(thread)
    this._threads[cleanThread.threadID] = cleanThread
    this._threadNameToId[cleanThread.name] = cleanThread.threadID
  }

  _getThreadById(id: string): facebook.FacebookThread | undefined {
    return this._threads[id]
  }

  _getThreadByName(nameQuery: string): facebook.FacebookThread | null {
    let threadId = this._threadNameToId[nameQuery]
    if (!threadId) {
      const threadName = Object.keys(this._threadNameToId).find(name =>
        name.toLowerCase().startsWith(nameQuery.toLowerCase()),
      );
      if (!threadName) return null

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

  async getThread(query: ThreadQuery): Promise<facebook.BaseFacebookThread | null> {
    let thread = undefined;
    const { name, id } = query
    // look for ID, then for name
    if (id) {
      thread = this._getThreadById(id)
    } else if (name) {
      thread = this._getThreadByName(name)
    }

    if (thread) return Promise.resolve(thread)

    if (id) {
      return await this._refreshThread(id)
    }

    return Promise.resolve(null)
  }

  getThreadList(limit?: number, order: 'asc' | 'desc' = 'desc'): Array<facebook.BaseFacebookThread> {
    return sortObjects(Object.values(this._threads), "lastMessageTimestamp", order).slice(0, limit)
  }
}