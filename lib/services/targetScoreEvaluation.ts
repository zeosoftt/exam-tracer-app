/**
 * Target Score Evaluation Service
 * 
 * Calculates smart evaluation metrics based on target score:
 * - Required net score for target achievement
 * - Current net score and success rate per topic
 * - Recommendation: REPEAT, IMPROVABLE, or GOOD
 * 
 * Follows SOLID principles and clean architecture
 */

import { getRequiredNet } from '@/config/targetScoreMaps';

/**
 * Evaluation result status
 */
export enum TopicEvaluationStatus {
  GOOD = 'GOOD', // İYİ - >= 95% of required
  IMPROVABLE = 'IMPROVABLE', // GELİŞTİRİLEBİLİR - >= 80% of required
  REPEAT = 'REPEAT', // TEKRAR - < 80% of required
}

/**
 * Topic evaluation result
 */
export interface TopicEvaluationResult {
  topicId: string;
  topicName: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  topicNet: number;
  topicSuccessRate: number;
  requiredSuccessRate: number;
  requiredNet: number;
  status: TopicEvaluationStatus;
  isGood: boolean;
  isImprovable: boolean;
  needsRepeat: boolean;
}

/**
 * Evaluation configuration
 */
export interface EvaluationConfig {
  targetScore: number;
  totalExamQuestions: number;
  examCode?: string;
  goodThreshold?: number; // Default: 0.95 (95%)
  improvableThreshold?: number; // Default: 0.80 (80%)
  wrongAnswerPenalty?: number; // Default: 4 (KPSS: -1/4 per wrong)
}

/**
 * Default evaluation configuration
 */
const DEFAULT_CONFIG: Required<EvaluationConfig> = {
  targetScore: 0,
  totalExamQuestions: 100,
  examCode: 'KPSS',
  goodThreshold: 0.95,
  improvableThreshold: 0.80,
  wrongAnswerPenalty: 4,
};

/**
 * Calculate net score using KPSS formula
 * Net = Doğru - (Yanlış / Penalty)
 * 
 * @param correctAnswers - Number of correct answers
 * @param wrongAnswers - Number of wrong answers
 * @param penalty - Penalty for wrong answers (default: 4 for KPSS)
 * @returns Net score
 */
export function calculateNetScore(
  correctAnswers: number,
  wrongAnswers: number,
  penalty: number = 4
): number {
  if (correctAnswers === 0 && wrongAnswers === 0) {
    return 0;
  }
  
  const net = correctAnswers - wrongAnswers / penalty;
  return Math.max(0, Math.round(net * 100) / 100); // Round to 2 decimals, min 0
}

/**
 * Calculate success rate
 * Success Rate = Net / Total Questions
 * 
 * @param netScore - Net score
 * @param totalQuestions - Total number of questions
 * @returns Success rate (0-1)
 */
export function calculateSuccessRate(
  netScore: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) {
    return 0;
  }
  
  const rate = netScore / totalQuestions;
  return Math.max(0, Math.min(1, Math.round(rate * 10000) / 10000)); // Round to 4 decimals, clamp 0-1
}

/**
 * Calculate required success rate for target score
 * 
 * @param config - Evaluation configuration
 * @returns Required success rate (0-1)
 */
export function calculateRequiredSuccessRate(
  config: EvaluationConfig
): number {
  const {
    targetScore,
    totalExamQuestions,
    examCode,
  } = config;
  
  if (totalExamQuestions === 0) {
    return 0;
  }
  
  // Get required net from target score map
  const requiredNet = getRequiredNet(targetScore, examCode);
  
  // Convert to success rate
  const requiredRate = requiredNet / totalExamQuestions;
  
  return Math.max(0, Math.min(1, Math.round(requiredRate * 10000) / 10000));
}

/**
 * Evaluate topic status based on success rate
 * 
 * @param topicSuccessRate - Topic success rate (0-1)
 * @param requiredSuccessRate - Required success rate (0-1)
 * @param goodThreshold - Threshold for GOOD status (default: 0.95)
 * @param improvableThreshold - Threshold for IMPROVABLE status (default: 0.80)
 * @returns Evaluation status
 */
export function evaluateTopicStatus(
  topicSuccessRate: number,
  requiredSuccessRate: number,
  goodThreshold: number = 0.95,
  improvableThreshold: number = 0.80
): TopicEvaluationStatus {
  const requiredAt95 = requiredSuccessRate * goodThreshold;
  const requiredAt80 = requiredSuccessRate * improvableThreshold;
  
  if (topicSuccessRate >= requiredAt95) {
    return TopicEvaluationStatus.GOOD;
  } else if (topicSuccessRate >= requiredAt80) {
    return TopicEvaluationStatus.IMPROVABLE;
  } else {
    return TopicEvaluationStatus.REPEAT;
  }
}

/**
 * Evaluate a single topic
 * OPTIMIZED: Accepts pre-calculated requiredSuccessRate and requiredNet to avoid recalculation
 * 
 * @param topicData - Topic question statistics
 * @param config - Evaluation configuration
 * @param preCalculatedValues - Optional pre-calculated values to avoid recalculation
 * @returns Topic evaluation result
 */
export function evaluateTopic(
  topicData: {
    topicId: string;
    topicName: string;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
  },
  config: EvaluationConfig,
  preCalculatedValues?: {
    requiredSuccessRate: number;
    requiredNet: number;
  }
): TopicEvaluationResult {
  const {
    goodThreshold = DEFAULT_CONFIG.goodThreshold,
    improvableThreshold = DEFAULT_CONFIG.improvableThreshold,
    wrongAnswerPenalty = DEFAULT_CONFIG.wrongAnswerPenalty,
  } = config;
  
  // Calculate topic metrics
  const topicNet = calculateNetScore(
    topicData.correctAnswers,
    topicData.wrongAnswers,
    wrongAnswerPenalty
  );
  
  const topicSuccessRate = calculateSuccessRate(
    topicNet,
    topicData.totalQuestions
  );
  
  // OPTIMIZED: Use pre-calculated values if provided, otherwise calculate
  const requiredSuccessRate = preCalculatedValues?.requiredSuccessRate ?? calculateRequiredSuccessRate(config);
  const requiredNet = preCalculatedValues?.requiredNet ?? getRequiredNet(config.targetScore, config.examCode);
  
  // Evaluate status
  const status = evaluateTopicStatus(
    topicSuccessRate,
    requiredSuccessRate,
    goodThreshold,
    improvableThreshold
  );
  
  return {
    topicId: topicData.topicId,
    topicName: topicData.topicName,
    totalQuestions: topicData.totalQuestions,
    correctAnswers: topicData.correctAnswers,
    wrongAnswers: topicData.wrongAnswers,
    topicNet,
    topicSuccessRate,
    requiredSuccessRate,
    requiredNet,
    status,
    isGood: status === TopicEvaluationStatus.GOOD,
    isImprovable: status === TopicEvaluationStatus.IMPROVABLE,
    needsRepeat: status === TopicEvaluationStatus.REPEAT,
  };
}

/**
 * Evaluate multiple topics
 * OPTIMIZED: Pre-calculates requiredSuccessRate and requiredNet once for all topics
 * 
 * @param topicsData - Array of topic question statistics
 * @param config - Evaluation configuration
 * @returns Array of topic evaluation results
 */
export function evaluateTopics(
  topicsData: Array<{
    topicId: string;
    topicName: string;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
  }>,
  config: EvaluationConfig
): TopicEvaluationResult[] {
  // OPTIMIZED: Calculate required values once instead of N times
  const requiredSuccessRate = calculateRequiredSuccessRate(config);
  const requiredNet = getRequiredNet(config.targetScore, config.examCode);
  
  const preCalculatedValues = {
    requiredSuccessRate,
    requiredNet,
  };
  
  // Use pre-calculated values for all topics
  return topicsData.map((topic) => evaluateTopic(topic, config, preCalculatedValues));
}

/**
 * Get summary statistics from evaluations
 * 
 * @param evaluations - Array of topic evaluations
 * @returns Summary statistics
 */
export function getEvaluationSummary(
  evaluations: TopicEvaluationResult[]
): {
  totalTopics: number;
  goodTopics: number;
  improvableTopics: number;
  repeatTopics: number;
  averageSuccessRate: number;
  averageNet: number;
} {
  if (evaluations.length === 0) {
    return {
      totalTopics: 0,
      goodTopics: 0,
      improvableTopics: 0,
      repeatTopics: 0,
      averageSuccessRate: 0,
      averageNet: 0,
    };
  }
  
  const goodTopics = evaluations.filter((e) => e.isGood).length;
  const improvableTopics = evaluations.filter((e) => e.isImprovable).length;
  const repeatTopics = evaluations.filter((e) => e.needsRepeat).length;
  
  const totalSuccessRate = evaluations.reduce(
    (sum, e) => sum + e.topicSuccessRate,
    0
  );
  const averageSuccessRate = totalSuccessRate / evaluations.length;
  
  const totalNet = evaluations.reduce((sum, e) => sum + e.topicNet, 0);
  const averageNet = totalNet / evaluations.length;
  
  return {
    totalTopics: evaluations.length,
    goodTopics,
    improvableTopics,
    repeatTopics,
    averageSuccessRate,
    averageNet,
  };
}
