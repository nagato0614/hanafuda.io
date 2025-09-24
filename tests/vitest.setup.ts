import { afterEach } from 'vitest';
import { config } from '@vue/test-utils';

afterEach(() => {
  config.global.stubs = {};
  config.global.mocks = {};
});
