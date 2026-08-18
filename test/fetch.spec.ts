// FIXME: This is from the original html5parser tests, converted to bun test...
// however it's non-deterministic and therefore not as valuable as reproducible
// tests. We should instead use fixtures and test against those.

// FIXME: There are no assertions, so it's not really a test at all beyond
// detecting thrown errors. Add assertions.

import { describe, expect, test } from "bun:test";
import { parse } from "../src/parse.ts";

async function run(url: string) {
  const id = url.replaceAll(/\W+/gu, "_").replaceAll(/^_+|_+$/gu, "");

  try {
    const response = await fetch(url);
    const data = await response.text();
    // oxlint-disable-next-line no-console
    console.log("[FETCH:OK]: %s", url);
    await Bun.write(`test-cache/${id}.html`, data);
    // oxlint-disable-next-line no-console
    console.time(`parse:${url}`);
    const ast = parse(data);
    // oxlint-disable-next-line no-console
    console.timeEnd(`parse:${url}`);
    await Bun.write(`test-cache/${id}.json`, JSON.stringify(ast, null, 2));
  } catch (error) {
    // oxlint-disable-next-line no-console
    console.error("[ERR]: %s, %s", id, (error instanceof Error && error.message) || error);
    expect.unreachable();
  }
}

const scenes = [
  "https://www.baidu.com/",
  "https://www.qq.com/?fromdefault",
  "https://www.taobao.com/",
];

describe("real scenarios", () => {
  test.each(scenes)("parse %s", (scene) => run(scene), { retry: 3 });
});
