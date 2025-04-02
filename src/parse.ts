import { noNestedTags, selfCloseTags } from './config';
import { type Token, TokenKind, tokenize } from './tokenize';
import {
  type Attribute,
  type AttributeValue,
  type Node,
  SyntaxKind,
  type Tag,
  type Text,
} from './types';
import { getLineRanges, getPosition } from './utils';
import { walk } from './walk';

interface Context {
  parent: Context | undefined;
  tag: Tag;
}

export interface ParseOptions {
  // create tag's attributes map
  // if true, will set Tag.attributeMap property
  // as a `Record<string, Attribute>`
  setAttributeMap: boolean;
}

let index: number;
let count: number;
let tokens: Token[];
let tagChain: Context | undefined;
let nodes: Node[];
let token: Token;
let node: Text | undefined;
let buffer: string;
let lines: number[] | undefined;
let parseOptions: ParseOptions | undefined;

function init(input?: string, options?: ParseOptions) {
  if (input === undefined) {
    count = 0;
    tokens.length = 0;
    buffer = '';
  } else {
    tokens = tokenize(input);
    count = tokens.length;
    buffer = input;
  }
  index = 0;
  tagChain = undefined;
  nodes = [];
  // @ts-expect-error - clear token
  token = undefined;
  node = undefined;
  lines = undefined;
  parseOptions = options;
}

function pushNode(_node: Tag | Text) {
  if (!tagChain) {
    nodes.push(_node);
  } else if (
    _node.type === SyntaxKind.Tag &&
    _node.name === tagChain.tag.name &&
    // noNestedTags[_node.name]
    noNestedTags.has(_node.name)
  ) {
    tagChain = tagChain.parent;
    pushNode(_node);
  } else if (tagChain.tag.body) {
    tagChain.tag.end = _node.end;
    tagChain.tag.body.push(_node);
  }
}

function pushTagChain(tag: Tag) {
  tagChain = { parent: tagChain, tag };
  node = undefined;
}

function createLiteral(
  start = token.start,
  end = token.end,
  value = token.value,
): Text {
  return { start, end, value, type: SyntaxKind.Text };
}

function createTag(): Tag {
  return {
    start: token.start - 1, // include <
    end: token.end,
    type: SyntaxKind.Tag,
    open: createLiteral(token.start - 1), // not finished
    name: token.value,
    rawName: buffer.slice(token.start, token.end),
    attributes: [],
    attributeMap: undefined,
    body: null,
    close: null,
  };
}

function createAttribute(): Attribute {
  return {
    start: token.start,
    end: token.end,
    name: createLiteral(),
    value: undefined,
  };
}

function createAttributeValue(): AttributeValue {
  return {
    start: token.start,
    end: token.end,
    value:
      token.type === TokenKind.AttrValueNq
        ? token.value
        : token.value.slice(1, 1 + token.value.length - 2),
    quote:
      token.type === TokenKind.AttrValueNq
        ? undefined
        : token.type === TokenKind.AttrValueSq
          ? "'"
          : '"',
  };
}

function appendLiteral(_node: Text | AttributeValue = node!) {
  // eslint-disable-next-line no-param-reassign
  _node.value += token.value;
  // eslint-disable-next-line no-param-reassign
  _node.end = token.end;
}

function unexpected() {
  lines ??= getLineRanges(buffer);
  const [line, column] = getPosition(lines, token.start);
  throw new Error(
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    `Unexpected token "${token.value}(${token.type})" at [${line},${column}]${
      tagChain ? ` when parsing tag: ${JSON.stringify(tagChain.tag.name)}.` : ''
    }`,
  );
}

function buildAttributeMap(tag: Tag) {
  // eslint-disable-next-line no-param-reassign
  tag.attributeMap = {};

  for (const attr of tag.attributes) {
    // eslint-disable-next-line no-param-reassign
    tag.attributeMap[attr.name.value] = attr;
  }
}

const enum OpenTagState {
  BeforeAttr,
  InName,
  AfterName,
  AfterEqual,
  InValue,
}

function parseOpenTag() {
  let state = OpenTagState.BeforeAttr;

  // let attr: Attribute = undefined as any;
  let attr: Attribute;

  const tag = createTag();
  pushNode(tag);
  if (tag.name === '' || tag.name === '!' || tag.name === '!--') {
    tag.open.value = `<${tag.open.value}`;

    if (index === count) return;

    token = tokens[++index];

    if (token.type !== TokenKind.OpenTagEnd) {
      node = createLiteral();
      tag.body = [node];

      while (++index < count) {
        token = tokens[index];

        if (token.type === TokenKind.OpenTagEnd) {
          node = undefined;
          break;
        }
        appendLiteral();
      }
    }

    tag.close = createLiteral(token.start, token.end + 1, `${token.value}>`);
    tag.end = tag.close.end;

    return;
  }

  while (++index < count) {
    token = tokens[index];

    if (token.type === TokenKind.OpenTagEnd) {
      // eslint-disable-next-line no-multi-assign
      tag.end = tag.open.end = token.end + 1;
      tag.open.value = buffer.slice(tag.open.start, tag.open.end);

      // if (token.value === '' && !selfCloseTags[tag.name]) {
      if (token.value === '' && !selfCloseTags.has(tag.name)) {
        tag.body = [];
        pushTagChain(tag);
      } else {
        tag.body = undefined;
      }
      break;
    }

    switch (state) {
      case OpenTagState.BeforeAttr:
        if (token.type !== TokenKind.Whitespace) {
          attr = createAttribute();
          state = OpenTagState.InName;
          tag.attributes.push(attr);
        }
        break;

      case OpenTagState.InName:
        if (token.type === TokenKind.Whitespace) {
          state = OpenTagState.AfterName;
        } else if (token.type === TokenKind.AttrValueEq) {
          state = OpenTagState.AfterEqual;
        } else {
          appendLiteral(attr!.name);
        }
        break;

      case OpenTagState.AfterName:
        if (token.type !== TokenKind.Whitespace) {
          if (token.type === TokenKind.AttrValueEq) {
            state = OpenTagState.AfterEqual;
          } else {
            attr = createAttribute();
            state = OpenTagState.InName;
            tag.attributes.push(attr);
          }
        }
        break;

      case OpenTagState.AfterEqual:
        if (token.type !== TokenKind.Whitespace) {
          attr!.value = createAttributeValue();
          if (token.type === TokenKind.AttrValueNq) {
            state = OpenTagState.InValue;
          } else {
            attr!.end = attr!.value.end;
            state = OpenTagState.BeforeAttr;
          }
        }
        break;

      default:
        if (token.type === TokenKind.Whitespace) {
          attr!.end = attr!.value!.end;
          state = OpenTagState.BeforeAttr;
        } else {
          appendLiteral(attr!.value);
        }
    }
  }
}

function parseCloseTag() {
  // let _context = tagChain;
  // while (true) {
  //   if (!_context || token.value.trim() === _context.tag.name) {
  //     break;
  //   }
  //   _context = _context.parent;
  // }
  let context = tagChain;
  while (context && token.value.trim() !== context.tag.name) {
    context = context.parent;
  }

  if (!context) return;

  context.tag.close = createLiteral(
    token.start - 2,
    token.end + 1,
    buffer.slice(token.start - 2, token.end + 1),
  );
  context.tag.end = context.tag.close.end;
  context = context.parent;
  tagChain = context;
}

export function parse(input: string, options?: ParseOptions): Node[] {
  init(input, {
    setAttributeMap: false,
    ...options,
  } as ParseOptions);

  while (index < count) {
    token = tokens[index];

    switch (token.type) {
      case TokenKind.Literal:
        if (node) {
          appendLiteral(node);
        } else {
          node = createLiteral();
          pushNode(node);
        }
        break;
      // eslint-disable-next-line unicorn/switch-case-braces
      case TokenKind.OpenTag: {
        node = undefined;
        parseOpenTag();
        break;
      }
      // eslint-disable-next-line unicorn/switch-case-braces
      case TokenKind.CloseTag: {
        node = undefined;
        parseCloseTag();
        break;
      }
      default:
        unexpected();
        break;
    }
    index++;
  }

  const ast = nodes;

  if (parseOptions?.setAttributeMap) {
    walk(ast, {
      enter(node2) {
        if (node2.type === SyntaxKind.Tag) {
          buildAttributeMap(node2);
        }
      },
    });
  }

  init();

  return ast;
}
