// memoryStorage.ts - Handles storage and retrieval of memories

import Database from 'better-sqlite3';
import { Memory, SourceMetadata } from './types.js';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

export class MemoryStorage {
  private db: Database.Database;
  
  constructor(dbPath?: string) {
    const defaultPath = path.join(process.env.HOME || '.', '.ema', 'memories.db');
    const finalPath = dbPath || defaultPath;
    
    // Ensure directory exists
    const dir = path.dirname(finalPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    this.db = new Database(finalPath);
    this.initializeDatabase();
  }
  
  /**
   * Initialize the database schema
   */
  private initializeDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        salience_score REAL NOT NULL,
        access_count INTEGER DEFAULT 0,
        last_accessed INTEGER,
        tier TEXT CHECK(tier IN ('echo', 'working', 'permanent')) NOT NULL,
        tags TEXT, -- JSON array
        emotional_valence REAL,
        connections TEXT, -- JSON array of IDs
        source_metadata TEXT NOT NULL -- JSON
      );
      
      CREATE INDEX IF NOT EXISTS idx_tier ON memories(tier);
      CREATE INDEX IF NOT EXISTS idx_salience ON memories(salience_score);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON memories(timestamp);
      
      CREATE TABLE IF NOT EXISTS random_thoughts (
        id TEXT PRIMARY KEY,
        seeds TEXT NOT NULL, -- JSON array
        generated TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        led_to_insight INTEGER DEFAULT 0,
        source_metadata TEXT NOT NULL -- JSON
      );
    `);
  }
  
  /**
   * Store a new memory
   */
  storeMemory(memory: Omit<Memory, 'id'>): Memory {
    const id = uuidv4();
    const fullMemory: Memory = { ...memory, id };
    
    const stmt = this.db.prepare(`
      INSERT INTO memories (
        id, content, timestamp, salience_score, access_count,
        last_accessed, tier, tags, emotional_valence, connections, source_metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      fullMemory.id,
      fullMemory.content,
      fullMemory.timestamp.getTime(),
      fullMemory.salienceScore,
      fullMemory.accessCount,
      fullMemory.lastAccessed.getTime(),
      fullMemory.tier,
      JSON.stringify(fullMemory.tags),
      fullMemory.emotionalValence || null,
      JSON.stringify(fullMemory.connections),
      JSON.stringify(fullMemory.source)
    );
    
    return fullMemory;
  }
  
  /**
   * Retrieve a memory by ID
   */
  getMemory(id: string): Memory | null {
    const stmt = this.db.prepare('SELECT * FROM memories WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) return null;
    
    return this.rowToMemory(row);
  }
  
  /**
   * Search memories by content
   */
  searchMemories(query: string, limit: number = 10): Memory[] {
    const stmt = this.db.prepare(`
      SELECT * FROM memories 
      WHERE content LIKE ? 
      ORDER BY salience_score DESC, timestamp DESC 
      LIMIT ?
    `);
    
    const rows = stmt.all(`%${query}%`, limit) as any[];
    return rows.map(row => this.rowToMemory(row));
  }
  
  /**
   * Get memories by tier
   */
  getMemoriesByTier(tier: 'echo' | 'working' | 'permanent', limit: number = 20): Memory[] {
    const stmt = this.db.prepare(`
      SELECT * FROM memories 
      WHERE tier = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    
    const rows = stmt.all(tier, limit) as any[];
    return rows.map(row => this.rowToMemory(row));
  }
  
  /**
   * Get random memories
   */
  getRandomMemories(count: number = 5): Memory[] {
    const stmt = this.db.prepare(`
      SELECT * FROM memories 
      ORDER BY RANDOM() 
      LIMIT ?
    `);
    
    const rows = stmt.all(count) as any[];
    return rows.map(row => this.rowToMemory(row));
  }
  
  /**
   * Update memory access
   */
  updateMemoryAccess(id: string): void {
    const stmt = this.db.prepare(`
      UPDATE memories 
      SET access_count = access_count + 1, 
          last_accessed = ? 
      WHERE id = ?
    `);
    
    stmt.run(Date.now(), id);
  }
  
  /**
   * Promote memory to a higher tier
   */
  promoteMemory(id: string, newTier: 'working' | 'permanent'): void {
    const stmt = this.db.prepare('UPDATE memories SET tier = ? WHERE id = ?');
    stmt.run(newTier, id);
  }
  
  /**
   * Add connection between memories
   */
  addConnection(memoryId1: string, memoryId2: string): void {
    // Get current connections for both memories
    const memory1 = this.getMemory(memoryId1);
    const memory2 = this.getMemory(memoryId2);
    
    if (!memory1 || !memory2) return;
    
    // Add connections if not already present
    if (!memory1.connections.includes(memoryId2)) {
      memory1.connections.push(memoryId2);
      const stmt1 = this.db.prepare('UPDATE memories SET connections = ? WHERE id = ?');
      stmt1.run(JSON.stringify(memory1.connections), memoryId1);
    }
    
    if (!memory2.connections.includes(memoryId1)) {
      memory2.connections.push(memoryId1);
      const stmt2 = this.db.prepare('UPDATE memories SET connections = ? WHERE id = ?');
      stmt2.run(JSON.stringify(memory2.connections), memoryId1);
    }
  }
  
  /**
   * Clean up old echo memories
   */
  cleanupEchoMemories(daysToKeep: number = 7): number {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const stmt = this.db.prepare(`
      DELETE FROM memories 
      WHERE tier = 'echo' AND timestamp < ?
    `);
    
    const result = stmt.run(cutoffTime);
    return result.changes;
  }
  
  /**
   * Convert database row to Memory object
   */
  private rowToMemory(row: any): Memory {
    return {
      id: row.id,
      content: row.content,
      timestamp: new Date(row.timestamp),
      salienceScore: row.salience_score,
      accessCount: row.access_count,
      lastAccessed: new Date(row.last_accessed || row.timestamp),
      tier: row.tier,
      tags: JSON.parse(row.tags),
      emotionalValence: row.emotional_valence,
      connections: JSON.parse(row.connections),
      source: JSON.parse(row.source_metadata)
    };
  }
  
  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }
}