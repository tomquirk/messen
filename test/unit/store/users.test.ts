import { expect } from 'chai';

import { getUserStore } from '../../mock';
import { UserStore } from '../../../src/store/users'

describe('User Store', function () {
  let userStore: UserStore;
  before(() => {
    userStore = getUserStore()
  });

  it('should be able to get a user by id', async function () {
    await userStore.getUser({ id: '100003961877411' }).then(user => {
      expect(user).to.exist;
      expect(user.id).to.equal('100003961877411')
    })
  });

  it('should be able to get a user by name', async function () {
    await userStore.getUser({ name: 'tom quirk' }).then(user => {
      expect(user).to.exist;
      expect(user.id).to.equal('100003961877411')
    })
  });

  it('should be able to get a user by fuzzy user name', async function () {
    await userStore.getUser({ name: 'to' }).then(user => {
      expect(user).to.exist;
      expect(user.id).to.equal('100003961877411')
    })
  });

  it('should be able to get a user by id when query contains both name and id', async function () {
    await userStore.getUser({ id: '100003961877411', name: 'ahhaha' }).catch(user => {
      expect(user).to.exist;
      expect(user.id).to.equal('100003961877411')
    })
  });

  it('should be able to get the currently logged in user (me user)', function () {
    expect(userStore.me.user).to.exist
    expect(userStore.me.user.id).to.equal('100035969370185')
    expect(userStore.me.friends.length).to.be.above(0)
    expect(userStore.me.friends[0].id).to.equal('100003961877411')
  });
});
