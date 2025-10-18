export function makeCodePoints(input: string): {
  lower: number[];
  upper: number[];
  length: number;
} {
  return {
    lower: input
      .toLowerCase()
      .split("")
      .map((c) => c.charCodeAt(0)),
    upper: input
      .toUpperCase()
      .split("")
      .map((c) => c.charCodeAt(0)),
    length: input.length,
  };
}
