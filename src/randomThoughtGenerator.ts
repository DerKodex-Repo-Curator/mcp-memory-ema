// randomThoughtGenerator.ts - Generates creative random thoughts from word seeds

import { RandomThought, SourceMetadata } from './types.js';
import { v4 as uuidv4 } from 'uuid';

// Common words likely to be single tokens
const TOKEN_VOCABULARY = [
  // Nature
  "tree", "water", "fire", "wind", "stone", "light", "dark", "sun", "moon", "star",
  "cloud", "rain", "snow", "ice", "earth", "sky", "ocean", "mountain", "river", "forest",
  "leaf", "flower", "seed", "root", "branch", "bird", "fish", "butterfly", "bee", "wolf",
  
  // Abstract concepts
  "time", "space", "dream", "memory", "thought", "feeling", "mind", "soul", "spirit", "heart",
  "love", "fear", "joy", "anger", "hope", "peace", "war", "life", "death", "birth",
  "truth", "lie", "reality", "illusion", "chaos", "order", "balance", "harmony", "discord", "silence",
  
  // Sensory
  "color", "sound", "taste", "smell", "touch", "music", "voice", "echo", "rhythm", "melody",
  "red", "blue", "green", "yellow", "purple", "black", "white", "gold", "silver", "shadow",
  
  // Actions
  "dance", "sing", "fly", "swim", "run", "walk", "sleep", "wake", "grow", "fade",
  "create", "destroy", "build", "break", "connect", "separate", "find", "lose", "remember", "forget",
  
  // Descriptors
  "hot", "cold", "soft", "hard", "smooth", "rough", "sweet", "bitter", "sharp", "dull",
  "bright", "dim", "loud", "quiet", "fast", "slow", "heavy", "light", "old", "new",
  
  // Philosophical
  "existence", "void", "infinite", "finite", "eternal", "moment", "consciousness", "awareness", "being", "nothing",
  "question", "answer", "mystery", "knowledge", "wisdom", "folly", "paradox", "truth", "meaning", "purpose"
];

export class RandomThoughtGenerator {
  private vocabulary: string[];
  
  constructor(customVocabulary?: string[]) {
    this.vocabulary = customVocabulary || TOKEN_VOCABULARY;
  }
  
  /**
   * Generate three random seed words
   */
  generateSeeds(): string[] {
    const seeds: string[] = [];
    const usedIndices = new Set<number>();
    
    while (seeds.length < 3) {
      const index = Math.floor(Math.random() * this.vocabulary.length);
      if (!usedIndices.has(index)) {
        usedIndices.add(index);
        seeds.push(this.vocabulary[index]);
      }
    }
    
    return seeds;
  }
  
  /**
   * Generate a creative thought from three seed words
   * This is a placeholder - in production, this would use Ollama or another model
   */
  async generateThought(seeds: string[]): Promise<string> {
    // Templates for different types of thoughts
    const templates = [
      // Poetic/metaphorical
      `What if ${seeds[0]} could teach ${seeds[1]} the language of ${seeds[2]}?`,
      `In the space between ${seeds[0]} and ${seeds[1]}, ${seeds[2]} finds its meaning.`,
      `${seeds[0]} whispers to ${seeds[1]}, but only ${seeds[2]} understands.`,
      
      // Philosophical
      `Is ${seeds[0]} merely ${seeds[1]} waiting to become ${seeds[2]}?`,
      `The ${seeds[0]} of ${seeds[1]} reveals the hidden ${seeds[2]} within.`,
      `When ${seeds[0]} meets ${seeds[1]}, does ${seeds[2]} emerge or disappear?`,
      
      // Narrative
      `Once, ${seeds[0]} and ${seeds[1]} danced until ${seeds[2]} was born.`,
      `The ${seeds[0]} remembers when ${seeds[1]} was just ${seeds[2]}.`,
      `Every ${seeds[0]} contains a ${seeds[1]} dreaming of ${seeds[2]}.`,
      
      // Surreal
      `${seeds[0]} tastes like ${seeds[1]} sounds in the key of ${seeds[2]}.`,
      `If ${seeds[0]} had ${seeds[1]}'s eyes, would it see ${seeds[2]} differently?`,
      `The ${seeds[0]} wears ${seeds[1]} like a crown of ${seeds[2]}.`
    ];
    
    // Select a random template
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // For now, just use the template. In production, this would call Ollama
    return template;
  }
  
  /**
   * Create a complete RandomThought object
   */
  async createRandomThought(): Promise<RandomThought> {
    const seeds = this.generateSeeds();
    const generated = await this.generateThought(seeds);
    
    const sourceMetadata: SourceMetadata = {
      origin: 'generated',
      confidence: 0.7,
      timestamp: new Date().toISOString(),
      transformations: ['generated', 'creative']
    };
    
    return {
      id: uuidv4(),
      seeds,
      generated,
      timestamp: new Date(),
      ledToInsight: false,
      source: sourceMetadata
    };
  }
  
  /**
   * Generate a batch of random thoughts
   */
  async generateBatch(count: number): Promise<RandomThought[]> {
    const thoughts: RandomThought[] = [];
    
    for (let i = 0; i < count; i++) {
      thoughts.push(await this.createRandomThought());
    }
    
    return thoughts;
  }
}