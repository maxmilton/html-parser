export function makeCodePoints(input: string): {
  lower: number[];
  upper: number[];
  length: number;
} {
  return {
    lower: input
      .toLowerCase()
      .split("")
      .map((ch) => ch.charCodeAt(0)),
    upper: input
      .toUpperCase()
      .split("")
      .map((ch) => ch.charCodeAt(0)),
    length: input.length,
  };
}
