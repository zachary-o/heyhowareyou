export const getScoreColor = (score: number) => {
  if (score <= 3) return "#ff4d4d";
  if (score <= 6) return "#f5a623";
  return "#4ade80";
};
