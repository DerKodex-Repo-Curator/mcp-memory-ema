// memoryStorage.ts - Handles storage and retrieval of memories (in-memory version)

import { Memory, SourceMetadata, RandomThought } from './types.js';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

export class MemoryStorage {
  private memories: Map<string, Memory> = new Map();
  private randomThoughts: Map<string, RandomThought> = new Map();
  private persistencePath: string;
  
  constructor(dbPath?: string) {
    const defaultPath = path.join(process.env.HOME || '.', '.ema', 'memories.json');
    this.persistencePath = dbPath || defaultPath;
    
    // Ensure directory exists
    const dir = path.dirname(this.persistencePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Load existing data
    this.loadFromDisk();
  }
  
  /**
   * Store a new memory
   */
  storeMemory(memory: Omit<Memory, 'id'>): Memory {
    const id = uuidv4();
    const fullMemory: Memory = { ...memory, id };
    
    this.memories.set(id, fullMemory);
    this.saveToDisk();
    
    return fullMemory;
  }
  
  /**
   * Retrieve a memory by ID
   */
  getMemory(id: string): Memory | null {
    return this.memories.get(id) || null;
  }
  
  /**
   * Search memories by content
   */
  searchMemories(query: string, limit: number = 10): Memory[] {
    const results: Memory[] = [];
    const queryLower = query.toLowerCase();
    
    for (const memory of this.memories.values()) {
      if (memory.content.toLowerCase().includes(queryLower)) {
        results.push(memory);
      }
      if (results.length >= limit) break;
    }
    
    // Sort by salience score
    return results.sort((a, b) => b.salienceScore - a.salienceScore);
  }
  
  /**
   * Get memories by tier
   */
  getMemoriesByTier(tier: 'echo' | 'working' | 'permanent', limit: number = 20): Memory[] {
    const results: Memory[] = [];
    
    for (const memory of this.memories.values()) {
      if (memory.tier === tier) {
        results.push(memory);
      }
      if (results.length >= limit) break;
    }
    
    // Sort by timestamp (newest first)
    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  /**
   * Get random memories
   */
  getRandomMemories(count: number = 5): Memory[] {
    const allMemories = Array.from(this.memories.values());
    const shuffled = allMemories.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
  
  /**
   * Update memory access
   */
  updateMemoryAccess(id: string): void {
    const memory = this.memories.get(id);
    if (memory) {
      memory.accessCount++;
      memory.lastAccessed = new Date();
      this.saveToDisk();
    }
  }
  
  /**
   * Promote memory to a higher tier
   */
  promoteMemory(id: string, newTier: 'working' | 'permanent'): void {
    const memory = this.memories.get(id);
    if (memory) {
      memory.tier = newTier;
      this.saveToDisk();
    }
  }
  
  /**
   * Add connection between memories
   */
  addConnection(memoryId1: string, memoryId2: string): void {
    const memory1 = this.memories.get(memoryId1);
    const memory2 = this.memories.get(memoryId2);
    
    if (!memory1 || !memory2) return;
    
    // Add connections if not already present
    if (!memory1.connections.includes(memoryId2)) {
      memory1.connections.push(memoryId2);
    }
    
    if (!memory2.connections.includes(memoryId1)) {
      memory2.connections.push(memoryId1);
    }
    
    this.saveToDisk();
  }
  
  /**
   * Store a random thought
   */
  storeRandomThought(thought: RandomThought): void {
    this.randomThoughts.set(thought.id, thought);
    this.saveToDisk();
  }
  
  /**
   * Get statistics
   */
  getStats(): {
    totalMemories: number;
    byTier: { echo: number; working: number; permanent: number };
    averageSalience: number;
    totalRandomThoughts: number;
  } {
    const stats = {
      totalMemories: this.memories.size,
      byTier: { echo: 0, working: 0, permanent: 0 },
      averageSalience: 0,
      totalRandomThoughts: this.randomThoughts.size
    };
    
    let totalSalience = 0;
    
    for (const memory of this.memories.values()) {
      stats.byTier[memory.tier]++;
      totalSalience += memory.salienceScore;
    }
    
    if (stats.totalMemories > 0) {
      stats.averageSalience = totalSalience / stats.totalMemories;
    }
    
    return stats;
  }
  
  /**
   * Clean up old echo memories
   */
  cleanupEchoMemories(daysToKeep: number = 7): number {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    let deleted = 0;
    
    for (const [id, memory] of this.memories.entries()) {
      if (memory.tier === 'echo' && memory.timestamp.getTime() < cutoffTime) {
        this.memories.delete(id);
        deleted++;
      }
    }
    
    if (deleted > 0) {
      this.saveToDisk();
    }
    
    return deleted;
  }
  
  /**
   * Save to disk
   */
  private saveToDisk(): void {
    const data = {
      memories: Array.from(this.memories.entries()).map(([id, memory]) => ({
        ...memory,
        timestamp: memory.timestamp.toISOString(),
        lastAccessed: memory.lastAccessed.toISOString()
      })),
      randomThoughts: Array.from(this.randomThoughts.entries()).map(([id, thought]) => ({
        ...thought,
        timestamp: thought.timestamp.toISOString()
      }))
    };
    
    fs.writeFileSync(this.persistencePath, JSON.stringify(data, null, 2));
  }
  
  /**
   * Load from disk
   */
  private loadFromDisk(): void {
    if (!fs.existsSync(this.persistencePath)) {
      return;
    }
    
    try {
      const data = JSON.parse(fs.readFileSync(this.persistencePath, 'utf-8'));
      
      // Load memories
      if (data.memories) {
        for (const memoryData of data.memories) {
          const memory: Memory = {
            ...memoryData,
            timestamp: new Date(memoryData.timestamp),
            lastAccessed: new Date(memoryData.lastAccessed)
          };
          this.memories.set(memory.id, memory);
        }
      }
      
      // Load random thoughts
      if (data.randomThoughts) {
        for (const thoughtData of data.randomThoughts) {
          const thought: RandomThought = {
            ...thoughtData,
            timestamp: new Date(thoughtData.timestamp)
          };
          this.randomThoughts.set(thought.id, thought);
        }
      }
    } catch (error) {
      console.error('Error loading memories from disk:', error);
    }
  }
  
  /**
   * Close the storage (no-op for in-memory)
   */
  close(): void {
    this.saveToDisk();
  }
}