// example.ts - Example usage of the EMA system

import { EmergentMemoryArchitecture } from './emaCore.js';
import { ConversationSegment, SourceMetadata } from './types.js';

async function demonstrateEMA() {
  console.log('🧠 Emergent Memory Architecture Demo\n');
  
  // Initialize EMA with custom config
  const ema = new EmergentMemoryArchitecture({
    randomThought: {
      enabled: true,
      frequencyMinutes: 5,
      injectionProbability: 0.8, // High probability for demo
    },
    memoryExtraction: {
      enabled: true,
      minSalienceScore: 6, // Lower threshold for demo
      extractionInterval: 3, // Extract every 3 messages
    }
  });
  
  // Simulate a conversation about consciousness
  const conversation: ConversationSegment[] = [
    {
      content: "I've been thinking about how consciousness might emerge from memory patterns.",
      speaker: 'user',
      timestamp: new Date(),
      metadata: {
        origin: 'human',
        confidence: 1.0,
        timestamp: new Date().toISOString()
      }
    },
    {
      content: "That's a fascinating insight! The interplay between memory and consciousness suggests that our sense of self might be constructed from the patterns we recognize in our own memories.",
      speaker: 'assistant',
      timestamp: new Date(),
      metadata: {
        origin: 'generated',
        confidence: 0.9,
        timestamp: new Date().toISOString()
      }
    },
    {
      content: "Exactly! And what if random thoughts are crucial for breaking out of those patterns?",
      speaker: 'user',
      timestamp: new Date(),
      metadata: {
        origin: 'human',
        confidence: 1.0,
        timestamp: new Date().toISOString()
      }
    }
  ];
  
  // Process the conversation
  console.log('📝 Processing conversation segments...');
  for (const segment of conversation) {
    await ema.processConversation(segment);
    console.log(`- Processed: "${segment.content.substring(0, 50)}..."`);
  }
  
  // Generate a random thought
  console.log('\n🎲 Generating random thought...');
  const randomThought = await ema.generateRandomThought();
  if (randomThought) {
    console.log(`Seeds: [${randomThought.seeds.join(', ')}]`);
    console.log(`Thought: ${randomThought.generated}`);
  }
  
  // Store a memory with attribution
  console.log('\n💾 Storing attributed memory...');
  const searchResult: SourceMetadata = {
    origin: 'search',
    confidence: 0.85,
    timestamp: new Date().toISOString(),
    verification: 'partial'
  };
  
  const storedMemory = await ema.storeMemoryWithAttribution(
    "Research shows that consciousness may arise from the integration of multiple memory systems working in parallel.",
    searchResult,
    ['consciousness', 'research', 'memory-systems']
  );
  console.log(`Stored memory with ID: ${storedMemory.id}`);
  console.log(`Tier: ${storedMemory.tier}, Salience: ${storedMemory.salienceScore}`);
  
  // Surface relevant memory
  console.log('\n🔍 Searching for relevant memories...');
  const relevantMemory = await ema.surfaceRelevantMemory('consciousness patterns');
  if (relevantMemory) {
    console.log(`Found: "${relevantMemory.content.substring(0, 80)}..."`);
    console.log(`Source: ${relevantMemory.source.origin}, Confidence: ${relevantMemory.source.confidence}`);
  }
  
  // Get statistics
  console.log('\n📊 Memory Statistics:');
  const stats = ema.getMemoryStats();
  console.log(`Total memories: ${stats.totalMemories}`);
  console.log(`By tier: Echo=${stats.byTier.echo}, Working=${stats.byTier.working}, Permanent=${stats.byTier.permanent}`);
  console.log(`Average salience: ${stats.averageSalience.toFixed(2)}`);
  
  // Surface a random memory
  console.log('\n🎯 Surfacing random memory...');
  const randomMemory = await ema.surfaceRandomMemory();
  if (randomMemory) {
    console.log(`Random memory: "${randomMemory.content.substring(0, 80)}..."`);
  }
  
  // Cleanup
  ema.close();
  console.log('\n✅ Demo complete!');
}

// Run the demo
demonstrateEMA().catch(console.error);