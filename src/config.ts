export const selfCloseTags = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
  "!doctype",
  "",
  "!",
  "!--",
]);

export const noNestedTags = new Set(["li", "option", "select", "textarea"]);
