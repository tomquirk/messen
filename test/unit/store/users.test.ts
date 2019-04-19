import { expect } from 'chai';

import { getUserStore } from '../../mock';
import { UserStore } from '../../../src/store/users'

describe('User Store', function () {
  let userStore: UserStore;
  before(() => {
    userStore = getUserStore()
  });

  it('should be able to get a user by id', async function () {
    userStore.getUser({ id: '100003961877411' }).then(user => {
      expect(user).to.exist;
      expect(user.id).to.equal('100003961877411')
    })
  });

  it('should be able to get a user by name', async function () {
    userStore.getUser({ name: 'tom quirk' }).then(user => {
      expect(user).to.exist;
      expect(user.id).to.equal('100003961877411')
    })
  });

  it('should be able to get a user by fuzzy user name', async function () {
    userStore.getUser({ name: 'to' }).then(user => {
      expect(user).to.exist;
      expect(user.id).to.equal('100003961877411')
    })
  });

  it('should be able to get a user by id when query contains both name and id', async function () {
    userStore.getUser({ id: '100003961877411', name: 'ahhaha' }).catch(user => {
      expect(user).to.exist;
      expect(user.id).to.equal('100003961877411')
    })
  });
});
