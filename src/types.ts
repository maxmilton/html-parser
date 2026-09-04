// oxlint-disable-next-line typescript/ban-types
export type NumberOr<T extends number> = T | (number & {});

export const enum SyntaxKind {
  Text = 0,
  Tag = 1,
}

export interface BaseNode {
  start: number;
  end: number;
}

export interface Text extends BaseNode {
  type: SyntaxKind.Text;
  value: string;
}

export interface AttributeValue extends BaseNode {
  value: string;
  quote: "'" | '"' | undefined;
}

export interface Attribute extends BaseNode {
  name: Text;
  value: AttributeValue | undefined;
}

export interface Tag extends BaseNode {
  type: SyntaxKind.Tag;
  // original open tag, <Div id="id">
  open: Text;
  // lower case tag name, div
  name: string;
  // original case tag name, Div
  rawName: string;
  attributes: Attribute[];
  body:
    | (Tag | Text)[] // with close tag
    | undefined // self closed
    | null; // EOF before open tag end
  // original close tag, </DIV >
  close:
    | Text // with close tag
    | undefined // self closed
    | null; // EOF before end or without close tag
}

export type Node = Text | Tag;
