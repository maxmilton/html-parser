import { describe, expect, it } from "bun:test";
import { parse } from "../src/parse.ts";
import { type Attribute, type Node, SyntaxKind } from "../src/types.ts";
import { walk } from "../src/walk.ts";

function label(node: Node): string {
  return node.type === SyntaxKind.Tag ? node.name : node.value;
}

function parentLabel(node: Node | undefined): string | undefined {
  return node && label(node);
}

function setAttributeMap(
  attributeMaps: WeakMap<Node, Record<string, Attribute>>,
  node: Node,
): void {
  if (node.type !== SyntaxKind.Tag) return;

  // Use a null-prototype object to avoid prototype pollution.
  const attributeMap: Record<string, Attribute> = Object.create(null);
  for (const attribute of node.attributes) {
    attributeMap[attribute.name.value] ??= attribute;
  }
  attributeMaps.set(node, attributeMap);
}

describe("walk", () => {
  it("visits nodes depth-first with parent and index", () => {
    const ast = parse("<div><span>x</span>y</div><img><broken");
    const events: {
      phase: "enter" | "leave";
      node: string;
      parent: string | undefined;
      index: number;
    }[] = [];

    walk(ast, {
      enter(node, parent, index) {
        events.push({ phase: "enter", node: label(node), parent: parentLabel(parent), index });
      },
      leave(node, parent, index) {
        events.push({ phase: "leave", node: label(node), parent: parentLabel(parent), index });
      },
    });

    expect(events).toEqual([
      { phase: "enter", node: "div", parent: undefined, index: 0 },
      { phase: "enter", node: "span", parent: "div", index: 0 },
      { phase: "enter", node: "x", parent: "span", index: 0 },
      { phase: "leave", node: "x", parent: "span", index: 0 },
      { phase: "leave", node: "span", parent: "div", index: 0 },
      { phase: "enter", node: "y", parent: "div", index: 1 },
      { phase: "leave", node: "y", parent: "div", index: 1 },
      { phase: "leave", node: "div", parent: undefined, index: 0 },
      { phase: "enter", node: "img", parent: undefined, index: 1 },
      { phase: "leave", node: "img", parent: undefined, index: 1 },
      { phase: "enter", node: "broken", parent: undefined, index: 2 },
      { phase: "leave", node: "broken", parent: undefined, index: 2 },
    ]);
  });

  it("supports consumer-owned derived tag data", () => {
    const ast = parse('<div same="1" diff="2" same="3" />');
    const attributeMaps = new WeakMap<Node, Record<string, Attribute>>();

    walk(ast, {
      enter(node) {
        setAttributeMap(attributeMaps, node);
      },
    });

    expect(attributeMaps.get(ast[0])).toMatchObject({
      same: { name: { value: "same" }, value: { value: "1" } }, // first occurrence wins
      diff: { name: { value: "diff" }, value: { value: "2" } },
    });
  });
});
