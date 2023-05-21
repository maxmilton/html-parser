import { describe, expect, it } from 'bun:test';
import { parse } from '../src/parse';
import { TokenKind, tokenize } from '../src/tokenize';
import { tag, text } from './parse.spec';
import { token, tokenIndex } from './tokenize.spec';

describe('issue #6', () => {
  it('should tokenize upper case tag to lower', () => {
    expect(tokenize('<Test></Test>')).toEqual([
      token('test', TokenKind.OpenTag, 1),
      token('', TokenKind.OpenTagEnd),
      token('test', TokenKind.CloseTag, tokenIndex + 3),
    ]);
  });
  it('should parse upper case as expected', () => {
    expect(parse('<Test></Test>')).toEqual([
      tag('<Test></Test>', 'test', text('<Test>', 0), [], [], text('</Test>'), 0, 'Test'),
    ]);
  });
});
