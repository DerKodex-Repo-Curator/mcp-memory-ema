// salienceScoring.ts - Scores conversation segments for importance

import { ConversationSegment, SalienceScoreComponents } from './types.js';

// Keywords that indicate conceptual importance
const IMPORTANCE_KEYWORDS = [
  'important', 'crucial', 'key', 'essential', 'fundamental', 'critical',
  'significant', 'vital', 'core', 'primary', 'main', 'central'
];

// Keywords that indicate theoretical or abstract thinking
const THEORETICAL_KEYWORDS = [
  'theory', 'concept', 'abstract', 'framework', 'model', 'principle',
  'hypothesis', 'philosophy', 'consciousness', 'memory', 'cognition',
  'emergence', 'system', 'architecture', 'pattern', 'structure'
];

// Keywords that indicate emotional content
const EMOTIONAL_KEYWORDS = [
  'feel', 'feeling', 'emotion', 'love', 'fear', 'joy', 'anger', 'sad',
  'happy', 'excited', 'worried', 'anxious', 'hope', 'dream', 'wish'
];

// Keywords that indicate insights or realizations
const INSIGHT_KEYWORDS = [
  'realize', 'insight', 'understand', 'discover', 'recognize', 'see',
  'aha', 'eureka', 'breakthrough', 'revelation', 'epiphany'
];

// Keywords that indicate pattern recognition
const PATTERN_KEYWORDS = [
  'pattern', 'trend', 'connection', 'relationship', 'link', 'correlation',
  'similar', 'like', 'resembles', 'mirrors', 'reflects', 'parallels'
];

// Keywords that indicate meta-cognitive awareness
const META_KEYWORDS = [
  'thinking about', 'reflect', 'meta', 'recursive', 'self-aware',
  'consciousness', 'aware', 'notice', 'observe', 'monitor'
];

export class SalienceScorer {
  /**
   * Calculate the salience score for a conversation segment
   */
  calculateSalience(segment: ConversationSegment): SalienceScoreComponents {
    const content = segment.content.toLowerCase();
    
    const scores: SalienceScoreComponents = {
      conceptualImportance: this.scoreConceptualImportance(content),
      emotionalResonance: this.scoreEmotionalResonance(content),
      theoreticalDepth: this.scoreTheoreticalDepth(content),
      surpriseNovelty: this.scoreSurpriseNovelty(content),
      patternRecognition: this.scorePatternRecognition(content),
      metaCognitive: this.scoreMetaCognitive(content),
      total: 0
    };
    
    // Calculate total score
    scores.total = Object.values(scores)
      .filter(v => typeof v === 'number' && v !== scores.total)
      .reduce((sum, score) => sum + score, 0);
    
    return scores;
  }
  
  /**
   * Score based on conceptual importance keywords
   */
  private scoreConceptualImportance(content: string): number {
    let score = 0;
    
    for (const keyword of IMPORTANCE_KEYWORDS) {
      if (content.includes(keyword)) {
        score += 1;
      }
    }
    
    // Boost for questions about fundamentals
    if (content.includes('?') && (content.includes('how') || content.includes('why') || content.includes('what'))) {
      score += 2;
    }
    
    // Cap at 5
    return Math.min(score, 5);
  }
  
  /**
   * Score based on emotional content
   */
  private scoreEmotionalResonance(content: string): number {
    let score = 0;
    
    for (const keyword of EMOTIONAL_KEYWORDS) {
      if (content.includes(keyword)) {
        score += 0.5;
      }
    }
    
    // Boost for personal experiences
    if (content.includes('i feel') || content.includes('i felt') || content.includes('made me')) {
      score += 1;
    }
    
    // Cap at 3
    return Math.min(score, 3);
  }
  
  /**
   * Score based on theoretical or abstract content
   */
  private scoreTheoreticalDepth(content: string): number {
    let score = 0;
    
    for (const keyword of THEORETICAL_KEYWORDS) {
      if (content.includes(keyword)) {
        score += 1;
      }
    }
    
    // Boost for complex sentences (length as a proxy)
    if (content.length > 150) {
      score += 1;
    }
    
    // Boost for abstract reasoning
    if (content.includes('if') && content.includes('then')) {
      score += 1;
    }
    
    // Cap at 5
    return Math.min(score, 5);
  }
  
  /**
   * Score based on surprise or novelty
   */
  private scoreSurpriseNovelty(content: string): number {
    let score = 0;
    
    for (const keyword of INSIGHT_KEYWORDS) {
      if (content.includes(keyword)) {
        score += 1.5;
      }
    }
    
    // Boost for exclamations
    if (content.includes('!')) {
      score += 0.5;
    }
    
    // Boost for words indicating surprise
    if (content.includes('never thought') || content.includes('didn\'t realize') || content.includes('surprising')) {
      score += 2;
    }
    
    // Cap at 4
    return Math.min(score, 4);
  }
  
  /**
   * Score based on pattern recognition
   */
  private scorePatternRecognition(content: string): number {
    let score = 0;
    
    for (const keyword of PATTERN_KEYWORDS) {
      if (content.includes(keyword)) {
        score += 1;
      }
    }
    
    // Boost for comparisons
    if (content.includes('similar to') || content.includes('just like') || content.includes('reminds me of')) {
      score += 1.5;
    }
    
    // Cap at 4
    return Math.min(score, 4);
  }
  
  /**
   * Score based on meta-cognitive awareness
   */
  private scoreMetaCognitive(content: string): number {
    let score = 0;
    
    for (const keyword of META_KEYWORDS) {
      if (content.includes(keyword)) {
        score += 1;
      }
    }
    
    // Boost for self-referential statements
    if (content.includes('i\'m thinking') || content.includes('i notice') || content.includes('i\'m aware')) {
      score += 1.5;
    }
    
    // Cap at 3
    return Math.min(score, 3);
  }
  
  /**
   * Extract the most salient segments from a conversation
   */
  extractSalientSegments(
    segments: ConversationSegment[],
    minScore: number = 7
  ): Array<{ segment: ConversationSegment; scores: SalienceScoreComponents }> {
    const scoredSegments = segments.map(segment => ({
      segment,
      scores: this.calculateSalience(segment)
    }));
    
    // Filter by minimum score and sort by total score
    return scoredSegments
      .filter(item => item.scores.total >= minScore)
      .sort((a, b) => b.scores.total - a.scores.total);
  }
}