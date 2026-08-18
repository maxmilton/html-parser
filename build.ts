import { createBundle } from "dts-buddy";

console.time("prebuild");
await Bun.$`rm -rf dist`;
console.timeEnd("prebuild");

console.time("build");
await Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: "dist",
  minify: true,
  sourcemap: "linked",
});
console.timeEnd("build");

console.time("dts");
await createBundle({
  project: "tsconfig.json",
  output: "dist/index.d.ts",
  modules: {
    "@maxmilton/html-parser": "src/index.js",
  },
  include: ["src"],
});
console.timeEnd("dts");
