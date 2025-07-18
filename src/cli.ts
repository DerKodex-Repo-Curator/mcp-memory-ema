#!/usr/bin/env node
// cli.ts - Command-line interface for EMA

import { EmergentMemoryArchitecture } from './emaCore.js';
import { SourceMetadata } from './types.js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ema = new EmergentMemoryArchitecture();

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('🧠 Emergent Memory Architecture CLI');
  console.log('Commands: store, search, random, thought, stats, quit\n');
  
  while (true) {
    const command = await prompt('> ');
    
    switch (command.toLowerCase().trim()) {
      case 'store': {
        const content = await prompt('Content: ');
        const origin = await prompt('Origin (human/search/generated): ') as any;
        const confidence = parseFloat(await prompt('Confidence (0-1): '));
        
        const source: SourceMetadata = {
          origin,
          confidence,
          timestamp: new Date().toISOString()
        };
        
        const memory = await ema.storeMemoryWithAttribution(content, source);
        console.log(`✅ Stored with ID: ${memory.id} (tier: ${memory.tier})\n`);
        break;
      }
      
      case 'search': {
        const query = await prompt('Search query: ');
        const memory = await ema.surfaceRelevantMemory(query);
        
        if (memory) {
          console.log(`\n📝 Found memory:`);
          console.log(`Content: ${memory.content}`);
          console.log(`Source: ${memory.source.origin} (confidence: ${memory.source.confidence})`);
          console.log(`Tier: ${memory.tier}, Salience: ${memory.salienceScore}\n`);
        } else {
          console.log('❌ No relevant memories found\n');
        }
        break;
      }
      
      case 'random': {
        const memory = await ema.surfaceRandomMemory();
        
        if (memory) {
          console.log(`\n🎲 Random memory:`);
          console.log(`Content: ${memory.content}`);
          console.log(`Tier: ${memory.tier}\n`);
        } else {
          console.log('❌ No random memory surfaced\n');
        }
        break;
      }
      
      case 'thought': {
        const thought = await ema.generateRandomThought();
        
        if (thought) {
          console.log(`\n💭 Random thought:`);
          console.log(`Seeds: [${thought.seeds.join(', ')}]`);
          console.log(`Thought: ${thought.generated}\n`);
        } else {
          console.log('❌ No thought generated (probability check failed)\n');
        }
        break;
      }
      
      case 'stats': {
        const stats = ema.getMemoryStats();
        console.log(`\n📊 Memory Statistics:`);
        console.log(`Total: ${stats.totalMemories}`);
        console.log(`Echo: ${stats.byTier.echo}`);
        console.log(`Working: ${stats.byTier.working}`);
        console.log(`Permanent: ${stats.byTier.permanent}`);
        console.log(`Avg Salience: ${stats.averageSalience.toFixed(2)}\n`);
        break;
      }
      
      case 'quit':
      case 'exit': {
        ema.close();
        rl.close();
        console.log('👋 Goodbye!');
        process.exit(0);
      }
      
      default:
        console.log('❓ Unknown command. Try: store, search, random, thought, stats, quit\n');
    }
  }
}

main().catch(console.error);