import { computeDenemeTopicAnalysis } from '@/lib/deneme/analysis/computeDenemeTopicAnalysis';
import {
  computeApplicationRate,
  computeFakeMasteryScore,
  computeImpactScore,
  computeKnowledgeGap,
  getGapRiskLevel,
} from '@/lib/deneme/analysis/metrics';
import {
  computeKnowledgeScore,
  computePerformanceScore,
  getMasteryLevelLabel,
} from '@/lib/deneme/analysis/knowledgeScore';

describe('deneme analysis metrics', () => {
  it('computes knowledge score from progress signals', () => {
    const score = computeKnowledgeScore({
      status: 'COMPLETED',
      totalQuestions: 20,
      correctAnswers: 16,
      wrongAnswers: 4,
      spacedRepetitionLevel: 2,
      completedAt: new Date('2026-01-01'),
      lastReviewedAt: new Date('2026-03-01'),
    });
    expect(score).toBeGreaterThan(55);
    expect(getMasteryLevelLabel(score >= 80 ? 'mastered' : score >= 60 ? 'intermediate' : 'learning')).toBeTruthy();
  });

  it('computes performance from deneme answers', () => {
    expect(computePerformanceScore(3, 4)).toBe(75);
  });

  it('detects fake mastery when knowledge high and performance low', () => {
    const gap = computeKnowledgeGap(90, 20);
    expect(gap).toBe(70);
    expect(getGapRiskLevel(gap)).toBe('critical');
    expect(computeFakeMasteryScore(90, 20)).toEqual({ fakeMastery: true, score: 70 });
    expect(computeApplicationRate(90, 20)).toBeCloseTo(22.2, 1);
    expect(computeImpactScore(gap, 4, 20)).toBeGreaterThan(0);
  });

  it('does not penalize strong deneme when topic was not studied', () => {
    const gap = computeKnowledgeGap(15, 80);
    expect(gap).toBe(-65);
    expect(getGapRiskLevel(gap)).toBe('normal');
    expect(computeImpactScore(gap, 4, 20)).toBe(0);
    expect(computeFakeMasteryScore(15, 80)).toEqual({ fakeMastery: false, score: 0 });
    expect(computeApplicationRate(15, 80)).toBe(100);
    expect(computeApplicationRate(0, 75)).toBe(75);
  });

  it('builds topic analysis with priorities', () => {
    const result = computeDenemeTopicAnalysis([
      {
        topicId: 't1',
        topicName: 'Paragraf',
        subjectName: 'Türkçe',
        knowledge: {
          status: 'REVIEWED',
          totalQuestions: 20,
          correctAnswers: 18,
          wrongAnswers: 2,
          spacedRepetitionLevel: 3,
          completedAt: new Date('2026-01-01'),
          lastReviewedAt: new Date('2026-03-01'),
        },
        performance: {
          topicId: 't1',
          topicName: 'Paragraf',
          subjectId: 's1',
          subjectName: 'Türkçe',
          questionCount: 5,
          right: 1,
          wrong: 3,
          empty: 1,
        },
      },
    ]);

    expect(result.summary.topicsWithPerformance).toBe(1);
    expect(result.summary.criticalGapCount).toBe(1);
    expect(result.priorities[0]?.gap).toBeGreaterThan(30);
    expect(result.priorities[0]?.impactScore).toBeGreaterThan(0);
  });
});
