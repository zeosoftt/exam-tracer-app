/**
 * Target Score Maps
 * Maps target score (out of 100) to required net score for different exam types
 * This allows the system to calculate required success rates for target achievement
 */

export interface TargetScoreMap {
  [targetScore: number]: number; // targetScore -> requiredNet
}

/**
 * KPSS Target Score Map
 * Maps KPSS target score (0-100) to required net score
 * 
 * Example: To achieve 96/100 in KPSS, user needs ~95 net score
 */
export const KPSS_TARGET_SCORE_MAP: TargetScoreMap = {
  70: 55,
  80: 70,
  90: 85,
  96: 95,
  100: 100,
};

/**
 * Default Target Score Map (fallback)
 * Linear mapping: targetScore -> targetScore * 0.95
 */
export const DEFAULT_TARGET_SCORE_MAP: TargetScoreMap = {
  70: 66,
  80: 76,
  90: 86,
  95: 90,
  100: 95,
};

/**
 * Exam-specific target score maps
 * Add new exam types here for extensibility
 */
export const EXAM_TARGET_SCORE_MAPS: Record<string, TargetScoreMap> = {
  KPSS: KPSS_TARGET_SCORE_MAP,
  DEFAULT: DEFAULT_TARGET_SCORE_MAP,
};

/**
 * Get target score map for a given exam code
 * Falls back to DEFAULT if exam not found
 */
export function getTargetScoreMap(examCode?: string): TargetScoreMap {
  if (!examCode) {
    return DEFAULT_TARGET_SCORE_MAP;
  }
  
  const normalizedCode = examCode.toUpperCase();
  return EXAM_TARGET_SCORE_MAPS[normalizedCode] || DEFAULT_TARGET_SCORE_MAP;
}

/**
 * Interpolate required net for a target score using the map
 * If exact match not found, interpolates between nearest values
 */
export function getRequiredNet(
  targetScore: number,
  examCode?: string
): number {
  const map = getTargetScoreMap(examCode);
  
  // Exact match
  if (map[targetScore] !== undefined) {
    return map[targetScore];
  }
  
  // Find nearest lower and upper bounds
  const sortedScores = Object.keys(map)
    .map(Number)
    .sort((a, b) => a - b);
  
  // If target is below minimum, use minimum
  if (targetScore < sortedScores[0]) {
    return map[sortedScores[0]];
  }
  
  // If target is above maximum, use maximum
  if (targetScore > sortedScores[sortedScores.length - 1]) {
    return map[sortedScores[sortedScores.length - 1]];
  }
  
  // Find interpolation points
  let lowerScore = sortedScores[0];
  let upperScore = sortedScores[sortedScores.length - 1];
  
  for (let i = 0; i < sortedScores.length - 1; i++) {
    if (targetScore >= sortedScores[i] && targetScore <= sortedScores[i + 1]) {
      lowerScore = sortedScores[i];
      upperScore = sortedScores[i + 1];
      break;
    }
  }
  
  // Linear interpolation
  const lowerNet = map[lowerScore];
  const upperNet = map[upperScore];
  const ratio = (targetScore - lowerScore) / (upperScore - lowerScore);
  
  return Math.round(lowerNet + (upperNet - lowerNet) * ratio);
}
