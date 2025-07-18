#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { EmergentMemoryArchitecture } from './emaCore';
import { ConversationSegment, SourceMetadata } from './types';
import { randomThoughtMetatag, memoryMetatag, wrapInMetatag } from './metatags';

// Initialize EMA
const ema = new EmergentMemoryArchitecture();

const server = new Server(
  {
    name: 'mcp-memory-ema',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'ema_process_conversation',
        description: 'Process a conversation segment for memory extraction',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'The conversation content',
            },
            speaker: {
              type: 'string',
              enum: ['user', 'assistant'],
              description: 'Who said this',
            },
            metadata: {
              type: 'object',
              description: 'Optional source metadata',
            },
          },
          required: ['content', 'speaker'],
        },
      },
      {
        name: 'ema_generate_random_thought',
        description: 'Generate a random creative thought',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'ema_surface_relevant_memory',
        description: 'Surface a memory relevant to the given context',
        inputSchema: {
          type: 'object',
          properties: {
            context: {
              type: 'string',
              description: 'Context to search for relevant memories',
            },
          },
          required: ['context'],
        },
      },
      {
        name: 'ema_surface_random_memory',
        description: 'Surface a random memory from storage',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'ema_store_memory',
        description: 'Store a memory with source attribution',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Memory content to store',
            },
            source: {
              type: 'object',
              description: 'Source metadata',
              properties: {
                origin: {
                  type: 'string',
                  enum: ['human', 'search', 'memory', 'generated', 'tool', 'file', 'analysis'],
                },
                confidence: {
                  type: 'number',
                  minimum: 0,
                  maximum: 1,
                },
                timestamp: {
                  type: 'string',
                },
                verification: {
                  type: 'string',
                  enum: ['verified', 'unverified', 'partial'],
                },
              },
              required: ['origin', 'confidence', 'timestamp'],
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Optional tags for the memory',
            },
          },
          required: ['content', 'source'],
        },
      },
      {
        name: 'ema_get_memory_stats',
        description: 'Get statistics about stored memories',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'ema_cleanup_memories',
        description: 'Clean up old echo memories',
        inputSchema: {
          type: 'object',
          properties: {
            daysToKeep: {
              type: 'number',
              description: 'Days to keep echo memories (default: 7)',
              default: 7,
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'ema_process_conversation': {
        const { content, speaker, metadata } = args as any;
        const segment: ConversationSegment = {
          content,
          speaker,
          timestamp: new Date(),
          metadata,
        };
        
        await ema.processConversation(segment);
        
        return {
          content: [
            {
              type: 'text',
              text: 'Conversation segment processed for memory extraction.',
            },
          ],
        };
      }
      
      case 'ema_generate_random_thought': {
        const thought = await ema.generateRandomThought();
        
        if (!thought) {
          return {
            content: [
              {
                type: 'text',
                text: 'No random thought generated (probability check failed).',
              },
            ],
          };
        }
        
        // METATAG-IMPLEMENTATION: Wrap random thought in source attribution
        const taggedThought = randomThoughtMetatag(thought.generated, thought.seeds);
        
        return {
          content: [
            {
              type: 'text',
              text: taggedThought,
            },
          ],
        };
      }
      
      case 'ema_surface_relevant_memory': {
        const { context } = args as { context: string };
        const memory = await ema.surfaceRelevantMemory(context);
        
        if (!memory) {
          return {
            content: [
              {
                type: 'text',
                text: 'No relevant memories found.',
              },
            ],
          };
        }
        
        // METATAG-IMPLEMENTATION: Wrap surfaced memory with attribution
        const taggedMemory = memoryMetatag(memory.content, memory);
        
        return {
          content: [
            {
              type: 'text',
              text: taggedMemory,
            },
          ],
        };
      }
      
      case 'ema_surface_random_memory': {
        const memory = await ema.surfaceRandomMemory();
        
        if (!memory) {
          return {
            content: [
              {
                type: 'text',
                text: 'No random memory surfaced.',
              },
            ],
          };
        }
        
        // METATAG-IMPLEMENTATION: Wrap random memory with attribution
        const taggedMemory = memoryMetatag(memory.content, memory);
        
        return {
          content: [
            {
              type: 'text',
              text: taggedMemory,
            },
          ],
        };
      }
      
      case 'ema_store_memory': {
        const { content, source, tags } = args as {
          content: string;
          source: SourceMetadata;
          tags?: string[];
        };
        
        const memory = await ema.storeMemoryWithAttribution(content, source, tags);
        
        return {
          content: [
            {
              type: 'text',
              text: `Memory stored with ID: ${memory.id} (tier: ${memory.tier}, salience: ${memory.salienceScore})`,
            },
          ],
        };
      }
      
      case 'ema_get_memory_stats': {
        const stats = ema.getMemoryStats();
        
        return {
          content: [
            {
              type: 'text',
              text: `Memory statistics:\n- Total: ${stats.totalMemories}\n- Echo: ${stats.byTier.echo}\n- Working: ${stats.byTier.working}\n- Permanent: ${stats.byTier.permanent}\n- Average salience: ${stats.averageSalience.toFixed(2)}`,
            },
          ],
        };
      }
      
      case 'ema_cleanup_memories': {
        const { daysToKeep = 7 } = args as { daysToKeep?: number };
        const deleted = await ema.cleanup(daysToKeep);
        
        return {
          content: [
            {
              type: 'text',
              text: `Cleaned up ${deleted} old echo memories.`,
            },
          ],
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error('Tool execution error:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }
});

// Cleanup on exit
process.on('SIGINT', () => {
  ema.close();
  process.exit(0);
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);
console.error('mcp-memory-ema MCP server running on stdio');