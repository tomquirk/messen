import { expect } from 'chai';
import readline from 'readline';

import Messen from '../../src/messen';

// const TEST_THREAD_ID = 

function promptCode(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    console.log('Enter code > ');
    return rl.on('line', line => {
      resolve(line);
      rl.close();
    });
  });
}

describe('Messen', function () {
  let messen: Messen;
  beforeEach(() => {
    messen = new Messen();
    messen.getMfaCode = () => {
      return promptCode();
    };
  });

  it('should be able to log in to a real Facebook account', async function () {
    this.timeout(60 * 1000); // 60s timeout
    await messen
      .login({
        email: process.env.FACEBOOK_EMAIL,
        password: process.env.FACEBOOK_PASSWORD,
      }, false);
    expect(messen.state.authenticated).to.be.true;
  });

  // it('should be able to log out', async function () {
  //   this.timeout(60 * 1000); // 60s timeout
  //   await messen.logout();
  //   expect(messen.state.authenticated).to.be.false;
  // });

  it('should be able to log out', async function () {
    await messen.logout();
    expect(messen.state.authenticated).to.be.false;
  });
});
