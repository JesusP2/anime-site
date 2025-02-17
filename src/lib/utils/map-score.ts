export function mapScore(score: string | null) {
  if (typeof score !== "string") return null;
  const _score = parseFloat(score);
  if (isNaN(_score)) return null;
  return _score;
}
