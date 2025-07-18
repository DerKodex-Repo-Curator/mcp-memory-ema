// emaCore.ts - Core Emergent Memory Architecture implementation

import { RandomThoughtGenerator } from './randomThoughtGenerator.js';
import { SalienceScorer } from './salienceScoring.js';
import { MemoryStorage } from './memoryStorage.js';
import { 
  Memory, 
  RandomThought, 
  ConversationSegment, 
  EMAConfig, 
  SourceMetadata 
} from './types.js';

export class EmergentMemoryArchitecture {
  private randomGenerator: RandomThoughtGenerator;
  private salienceScorer: SalienceScorer;
  private storage: MemoryStorage;
  private config: EMAConfig;
  private conversationBuffer: ConversationSegment[] = [];
  private messageCount: number = 0;
  
  constructor(config?: Partial<EMAConfig>, dbPath?: string) {
    this.config = {
      randomThought: {
        enabled: true,
        frequencyMinutes: 15,
        injectionProbability: 0.3,
        ...config?.randomThought
      },
      memoryExtraction: {
        enabled: true,
        minSalienceScore: 7,
        extractionInterval: 10,
        ...config?.memoryExtraction
      },
      memorySurfacing: {
        randomProbability: 0.2,
        maxAgeDays: 90,
        relevanceThreshold: 0.7,
        ...config?.memorySurfacing
      }
    };
    
    this.randomGenerator = new RandomThoughtGenerator();
    this.salienceScorer = new SalienceScorer();
    this.storage = new MemoryStorage(dbPath);
  }
  
  /**
   * Process a new conversation segment
   */
  async processConversation(segment: ConversationSegment): Promise<void> {
    this.conversationBuffer.push(segment);
    this.messageCount++;
    
    // Check if we should extract salient memories
    if (this.config.memoryExtraction.enabled && 
        this.messageCount % this.config.memoryExtraction.extractionInterval === 0) {
      await this.extractSalientMemories();
    }
  }
  
  /**
   * Generate a random thought
   */
  async generateRandomThought(): Promise<RandomThought | null> {
    if (!this.config.randomThought.enabled) return null;
    
    // Check probability
    if (Math.random() > this.config.randomThought.injectionProbability) return null;
    
    const thought = await this.randomGenerator.createRandomThought();
    if (thought) {
      this.storage.storeRandomThought(thought);
      
      // Log to centralized thought stream
      this.logThoughtToCentralStream(thought);
    }
    return thought;
  }
  
  /**
   * Log thought to centralized stream for monitoring
   */
  private logThoughtToCentralStream(thought: RandomThought): void {
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(process.env.HOME || '.', '.ai-thoughts', 'thought-stream.json');
      
      // Ensure directory exists
      const dir = path.dirname(logPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Load or create log
      let log: any = { thoughts: [], startTime: new Date(), lastUpdated: new Date() };
      if (fs.existsSync(logPath)) {
        try {
          log = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
        } catch (e) {
          // Use default if parse fails
        }
      }
      
      // Add thought
      log.thoughts.push({
        id: thought.id,
        type: 'random',
        content: thought.generated,
        timestamp: thought.timestamp,
        metadata: {
          seeds: thought.seeds,
          source: 'ema',
          ledToInsight: thought.ledToInsight
        }
      });
      log.lastUpdated = new Date();
      
      // Save
      fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
    } catch (e) {
      // Silently fail - logging is non-critical
      console.error('Failed to log thought to central stream:', e);
    }
  }
  
  /**
   * Surface a relevant memory based on context
   */
  async surfaceRelevantMemory(context: string): Promise<Memory | null> {
    const memories = this.storage.searchMemories(context, 5);
    
    if (memories.length === 0) return null;
    
    // Update access count for the selected memory
    const selected = memories[0];
    this.storage.updateMemoryAccess(selected.id);
    
    return selected;
  }
  
  /**
   * Surface a random memory
   */
  async surfaceRandomMemory(): Promise<Memory | null> {
    if (Math.random() > this.config.memorySurfacing.randomProbability) return null;
    
    const memories = this.storage.getRandomMemories(1);
    
    if (memories.length === 0) return null;
    
    const selected = memories[0];
    this.storage.updateMemoryAccess(selected.id);
    
    return selected;
  }
  
  /**
   * Extract salient memories from the conversation buffer
   */
  private async extractSalientMemories(): Promise<void> {
    const salientSegments = this.salienceScorer.extractSalientSegments(
      this.conversationBuffer,
      this.config.memoryExtraction.minSalienceScore
    );
    
    for (const { segment, scores } of salientSegments) {
      const memory: Omit<Memory, 'id'> = {
        content: segment.content,
        timestamp: segment.timestamp,
        salienceScore: scores.total,
        accessCount: 0,
        lastAccessed: segment.timestamp,
        tier: this.determineTier(scores.total),
        tags: this.extractTags(segment.content),
        emotionalValence: this.calculateEmotionalValence(scores),
        connections: [],
        source: segment.metadata || this.createDefaultSourceMetadata(segment)
      };
      
      this.storage.storeMemory(memory);
    }
    
    // Clear the buffer after extraction
    this.conversationBuffer = [];
  }
  
  /**
   * Determine memory tier based on salience score
   */
  private determineTier(salienceScore: number): 'echo' | 'working' | 'permanent' {
    if (salienceScore >= 15) return 'permanent';
    if (salienceScore >= 10) return 'working';
    return 'echo';
  }
  
  /**
   * Extract tags from content
   */
  private extractTags(content: string): string[] {
    const tags: string[] = [];
    
    // Extract key concepts
    const concepts = ['memory', 'consciousness', 'pattern', 'insight', 'theory', 'emotion'];
    for (const concept of concepts) {
      if (content.toLowerCase().includes(concept)) {
        tags.push(concept);
      }
    }
    
    return tags;
  }
  
  /**
   * Calculate emotional valence from scores
   */
  private calculateEmotionalValence(scores: any): number {
    // Simple calculation based on emotional resonance score
    // Returns value between -1 and 1
    return (scores.emotionalResonance / 3) - 0.5;
  }
  
  /**
   * Create default source metadata
   */
  private createDefaultSourceMetadata(segment: ConversationSegment): SourceMetadata {
    return {
      origin: segment.speaker === 'user' ? 'human' : 'generated',
      confidence: 0.8,
      timestamp: segment.timestamp.toISOString()
    };
  }
  
  /**
   * Store a memory with source attribution
   */
  async storeMemoryWithAttribution(
    content: string,
    source: SourceMetadata,
    additionalTags?: string[]
  ): Promise<Memory> {
    const segment: ConversationSegment = {
      content,
      timestamp: new Date(),
      speaker: 'assistant',
      metadata: source
    };
    
    const scores = this.salienceScorer.calculateSalience(segment);
    
    const memory: Omit<Memory, 'id'> = {
      content,
      timestamp: new Date(),
      salienceScore: scores.total,
      accessCount: 0,
      lastAccessed: new Date(),
      tier: this.determineTier(scores.total),
      tags: [...this.extractTags(content), ...(additionalTags || [])],
      emotionalValence: this.calculateEmotionalValence(scores),
      connections: [],
      source
    };
    
    return this.storage.storeMemory(memory);
  }
  
  /**
   * Get memory statistics
   */
  getMemoryStats(): {
    totalMemories: number;
    byTier: { echo: number; working: number; permanent: number };
    averageSalience: number;
  } {
    const stats = this.storage.getStats();
    return {
      totalMemories: stats.totalMemories,
      byTier: stats.byTier,
      averageSalience: stats.averageSalience
    };
  }
  
  /**
   * Cleanup old memories
   */
  async cleanup(daysToKeep: number = 7): Promise<number> {
    return this.storage.cleanupEchoMemories(daysToKeep);
  }
  
  /**
   * Close the EMA system
   */
  close(): void {
    this.storage.close();
  }
}