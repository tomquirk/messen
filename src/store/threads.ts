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

  constructor(api: facebook.API) {
    this._api = api;
    this._threads = {}
    this._threadNameToId = {}
  }

  _upsertThread(thread: facebook.FacebookThread): void {
    console.log('here', thread)
    this._threads[thread.threadID] = thread
    this._threadNameToId[thread.name] = thread.threadID
  }

  _getThreadById(id: string): facebook.FacebookThread {
    return this._threads[id]
  }

  _getThreadByName(nameQuery: string): facebook.FacebookThread {
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
    console.log(`got ${threads.length} threads`)
    threads.forEach(thread => {
      this._upsertThread(thread);
    });
  }

  async getThread(query: ThreadQuery): Promise<facebook.FacebookThread> {
    let thread = undefined;

    if (query.name) {
      thread = this._getThreadByName(name)
    }

    if (query.id) {
      thread = this._getThreadById(query.id)
    } else if (query.name) {
      thread = this._getThreadByName(name)
    } else {
      return Promise.reject('Invalid params')
    }

    if (thread) return Promise.resolve(thread)

    if (!query.id) return Promise.reject('Invalid params')

    return await this._refreshThread(query.id)
  }
}