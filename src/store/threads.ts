import facebook from 'facebook-chat-api';
import api from '../api';

type ThreadQuery = {
  id: string,
  name: string
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

  constructor(api: facebook.API) {
    this._api = api;
    this._threads = {}
    this._threadNameToId = {}
  }

  _upsertThread(thread: facebook.FacebookThread): void {
    this._threads[thread.threadID] = thread
    this._threadNameToId[thread.name] = thread.threadID
  }

  _getThreadById(id: string): facebook.FacebookThread {
    return this._threads[id]
  }

  _getThreadByName(name: string): facebook.FacebookThread {
    const threadId = this._threadNameToId[name]
    if (!threadId) return

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

  async getThread(query: ThreadQuery): Promise<facebook.FacebookThread> {
    let thread = undefined;

    const { id, name } = query

    if (id) {
      thread = this._getThreadById(id)
    }

    if (name) {
      thread = this._getThreadByName(name)
    }

    if (thread) return Promise.resolve(thread)

    if (!id) return Promise.reject('Thread ID required in query')

    return await this._refreshThread(id)
  }
}