/* eslint-disable no-console */

// FIXME: This is from the original html5parser tests, converted to bun test...
// however it's non-deterministic and therefore not as valuable as reproducible
// tests. We should instead use fixtures and test against those.

// FIXME: There are no assertions, so it's not really a test at all beyond
// detecting thrown errors. Add assertions.

import { describe, it } from 'bun:test';
import { parse } from '../src/parse.ts';

async function run(url: string) {
  const id = url.replaceAll(/\W+/g, '_').replaceAll(/^_+|_+$/g, '');

  try {
    const response = await fetch(url);
    const data = await response.text();
    console.log('[FETCH:OK]: %s', url);
    await Bun.write(`test-cache/${id}.html`, data);
    console.time(`parse:${url}`);
    const ast = parse(data);
    console.timeEnd(`parse:${url}`);
    await Bun.write(`test-cache/${id}.json`, JSON.stringify(ast, null, 2));
  } catch (error) {
    console.error('[ERR]: %s, %s', id, (error instanceof Error && error.message) || error);
  }
}

const scenes = [
  'https://www.baidu.com/',
  'https://www.qq.com/?fromdefault',
  'https://www.taobao.com/',
];

describe('real scenarios', () => {
  for (const scene of scenes) {
    it(`parse ${scene}`, () => run(scene));
  }
});
