import { SyntaxKind, type Node } from './types';

export interface WalkOptions {
  enter?(node: Node, parent: Node | undefined, index: number): void;
  leave?(node: Node, parent: Node | undefined, index: number): void;
}

function visit(
  node: Node,
  parent: Node | undefined,
  index: number,
  options: WalkOptions,
) {
  options.enter?.(node, parent, index);
  if (node.type === SyntaxKind.Tag && Array.isArray(node.body)) {
    for (let i = 0; i < node.body.length; i++) {
      visit(node.body[i], node, i, options);
    }
  }
  options.leave?.(node, parent, index);
}

export function walk(ast: Node[], options: WalkOptions): void {
  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < ast.length; i++) {
    visit(ast[i], undefined, i, options);
  }
}
