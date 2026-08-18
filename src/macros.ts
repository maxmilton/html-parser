export function makeCodePoints(input: string): {
  lower: number[];
  upper: number[];
  length: number;
} {
  return {
    // oxlint-disable-next-line unicorn/prefer-spread
    lower: input
      .toLowerCase()
      .split("")
      .map((ch) => ch.charCodeAt(0)),
    // oxlint-disable-next-line unicorn/prefer-spread
    upper: input
      .toUpperCase()
      .split("")
      .map((ch) => ch.charCodeAt(0)),
    length: input.length,
  };
}
