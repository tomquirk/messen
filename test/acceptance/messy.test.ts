import { expect } from 'chai';
import readline from 'readline';

import Messy from '../../src/messy';
import config from '../../config/test.json';

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

describe('Messy', function() {
  let messy: Messy;
  beforeEach(() => {
    messy = new Messy();
    messy.getMfaCode = () => {
      return promptCode();
    };
  });

  it('should be able to log in to a real Facebook account', function() {
    this.timeout(60 * 1000); // 60s timeout
    return messy.login(config.credentials).then(() => {
      expect(messy.state.authenticated).to.be.true;
    });
  });
});
