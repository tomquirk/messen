import { expect } from 'chai';
import Messy from '../src/messy';

import config from '../config/test.json';

describe('Messy', () => {
  let messy: Messy;
  beforeEach(() => {
    messy = new Messy();
    messy.getMfaCode = () => {
      return Promise.resolve('967485');
    };
  });

  it('should be able to log in', () => {
    messy.login(config.credentials).then(() => {
      console.log('here');
    });
  });
});
