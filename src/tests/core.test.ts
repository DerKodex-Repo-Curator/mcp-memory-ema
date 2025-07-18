import { RandomThoughtGenerator } from '../randomThoughtGenerator';
import { SalienceScorer } from '../salienceScoring';
import { ConversationSegment } from '../types';

describe('RandomThoughtGenerator', () => {
  let generator: RandomThoughtGenerator;
  
  beforeEach(() => {
    generator = new RandomThoughtGenerator();
  });
  
  it('should generate three unique seed words', () => {
    const seeds = generator.generateSeeds();
    expect(seeds).toHaveLength(3);
    expect(new Set(seeds).size).toBe(3); // All unique
  });
  
  it('should generate a thought from seeds', async () => {
    const seeds = ['tree', 'water', 'light'];
    const thought = await generator.generateThought(seeds);
    expect(thought).toBeTruthy();
    expect(thought.length).toBeGreaterThan(0);
  });
  
  it('should create a complete random thought object', async () => {
    const thought = await generator.createRandomThought();
    expect(thought).toHaveProperty('id');
    expect(thought).toHaveProperty('seeds');
    expect(thought).toHaveProperty('generated');
    expect(thought).toHaveProperty('timestamp');
    expect(thought).toHaveProperty('ledToInsight');
    expect(thought).toHaveProperty('source');
    expect(thought.source.origin).toBe('generated');
  });
});

describe('SalienceScorer', () => {
  let scorer: SalienceScorer;
  
  beforeEach(() => {
    scorer = new SalienceScorer();
  });
  
  it('should score high for important concepts', () => {
    const segment: ConversationSegment = {
      content: 'This is a crucial insight about consciousness and memory patterns.',
      timestamp: new Date(),
      speaker: 'assistant'
    };
    
    const scores = scorer.calculateSalience(segment);
    expect(scores.conceptualImportance).toBeGreaterThan(0);
    expect(scores.theoreticalDepth).toBeGreaterThan(0);
    expect(scores.patternRecognition).toBeGreaterThan(0);
    expect(scores.total).toBeGreaterThan(5);
  });
  
  it('should score low for mundane content', () => {
    const segment: ConversationSegment = {
      content: 'Hello, how are you today?',
      timestamp: new Date(),
      speaker: 'user'
    };
    
    const scores = scorer.calculateSalience(segment);
    expect(scores.total).toBeLessThan(5);
  });
  
  it('should extract salient segments', () => {
    const segments: ConversationSegment[] = [
      {
        content: 'Just a normal greeting',
        timestamp: new Date(),
        speaker: 'user'
      },
      {
        content: 'I realize this pattern reveals a fundamental insight about consciousness!',
        timestamp: new Date(),
        speaker: 'assistant'
      }
    ];
    
    const salient = scorer.extractSalientSegments(segments, 5);
    expect(salient).toHaveLength(1);
    expect(salient[0].segment.content).toContain('fundamental insight');
  });
});