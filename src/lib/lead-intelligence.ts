type LeadSignalLike = {
  signalType: string;
  score: number;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeLeadIntelligence(fitScore: number | null | undefined, signals: LeadSignalLike[]) {
  const normalizedFit = clampScore(fitScore ?? 0);

  const intentSignalScore = signals
    .filter((signal) => ["INTENT", "TIMING", "REPLY"].includes(signal.signalType))
    .reduce((sum, signal) => sum + signal.score, 0);

  const icpSignalScore = signals
    .filter((signal) => ["FIT", "ICP"].includes(signal.signalType))
    .reduce((sum, signal) => sum + signal.score, 0);

  const intentScore = clampScore(normalizedFit * 0.22 + intentSignalScore);
  const icpScore = clampScore(normalizedFit * 0.58 + icpSignalScore);
  const priorityScore = clampScore(normalizedFit * 0.35 + intentScore * 0.35 + icpScore * 0.3);

  return {
    fitScore: normalizedFit,
    intentScore,
    icpScore,
    priorityScore,
  };
}

export function getPriorityBand(priorityScore: number) {
  if (priorityScore >= 80) return "critical";
  if (priorityScore >= 60) return "high";
  if (priorityScore >= 40) return "medium";
  return "low";
}