import { expect } from 'chai';

import { getUserStore } from '../../messen.mock';
import { UserStore } from '../../../src/store/users'

describe('User Store', function () {
  let userStore: UserStore;
  before(() => {
    userStore = getUserStore()
  });

  it('should be able to get a user by id', async function () {
    await userStore.getUser({ id: '100003961877411' }).then(user => {
      expect(user).to.exist;
      if (!user) throw new Error()
      expect(user.id).to.equal('100003961877411')
    })
  });

  it('should be able to get a user by name', async function () {
    await userStore.getUser({ name: 'tom quirk' }).then(user => {
      expect(user).to.exist;
      if (!user) throw new Error()
      expect(user.id).to.equal('100003961877411')
    })
  });

  it('should be able to get a user by fuzzy user name', async function () {
    await userStore.getUser({ name: 'to' }).then(user => {
      expect(user).to.exist;
      if (!user) throw new Error()
      expect(user.id).to.equal('100003961877411')
    })
  });

  it('should be able to get a user by id when query contains both name and id', async function () {
    await userStore.getUser({ id: '100003961877411', name: 'ahhaha' }).then(user => {
      expect(user).to.exist;
      if (!user) throw new Error()
      expect(user.id).to.equal('100003961877411')
    })
  });

  it('should be able to get a list of users from a list of user ids', async function () {
    await userStore.getUsers(['100003961877411', '100035969370185']).then(users => {
      expect(users).to.exist;
      expect(users.length).to.equal(2);
      const userA = users[0]
      const userB = users[1]
      if (!userA || !userB) throw new Error()
      expect(userA.id).to.equal('100003961877411')
      expect(userB.id).to.equal('100035969370185')
    })
  });

  it('should be able to get a list of users, the first being null', async function () {
    await userStore.getUsers(['bad user id', '100003961877411', '100035969370185']).then(users => {
      expect(users).to.exist;
      expect(users.length).to.equal(3);
      expect(users[0]).to.equal(undefined)
      const userA = users[1]
      const userB = users[2]
      if (!userA || !userB) throw new Error()
      expect(userA.id).to.equal('100003961877411')
      expect(userB.id).to.equal('100035969370185')
    })
  });


  it('should be able to get the currently logged in user (me user)', function () {
    expect(userStore.me.user).to.exist
    expect(userStore.me.user.id).to.equal('100035969370185')
    expect(userStore.me.friends.length).to.be.above(0)
    expect(userStore.me.friends[0].id).to.equal('100003961877411')
  });
});
