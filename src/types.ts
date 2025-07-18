// types.ts - Core types for the Emergent Memory Architecture

export interface SourceMetadata {
  origin: 'human' | 'search' | 'memory' | 'generated' | 'tool';
  confidence: number; // 0.0 - 1.0
  timestamp: string; // ISO-8601
  verification?: 'verified' | 'unverified' | 'partial';
  transformations?: string[]; // ['summarized', 'quoted', 'paraphrased', 'synthesized']
  relatedSources?: string[]; // UUIDs of related sources
}

export interface Memory {
  id: string;
  content: string;
  timestamp: Date;
  salienceScore: number;
  accessCount: number;
  lastAccessed: Date;
  tier: 'echo' | 'working' | 'permanent';
  tags: string[];
  emotionalValence?: number; // -1.0 to 1.0
  connections: string[]; // IDs of related memories
  source: SourceMetadata;
}

export interface RandomThought {
  id: string;
  seeds: string[]; // The 3 words
  generated: string;
  timestamp: Date;
  ledToInsight: boolean;
  source: SourceMetadata;
}

export interface ConversationSegment {
  content: string;
  timestamp: Date;
  speaker: 'user' | 'assistant';
  metadata?: SourceMetadata;
}

export interface SalienceScoreComponents {
  conceptualImportance: number;
  emotionalResonance: number;
  theoreticalDepth: number;
  surpriseNovelty: number;
  patternRecognition: number;
  metaCognitive: number;
  total: number;
}

export interface EMAConfig {
  randomThought: {
    enabled: boolean;
    frequencyMinutes: number;
    injectionProbability: number;
  };
  memoryExtraction: {
    enabled: boolean;
    minSalienceScore: number;
    extractionInterval: number; // messages
  };
  memorySurfacing: {
    randomProbability: number;
    maxAgeDays: number;
    relevanceThreshold: number;
  };
}