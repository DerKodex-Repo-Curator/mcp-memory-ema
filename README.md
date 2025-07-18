# mcp-memory-ema

Emergent Memory Architecture - A multi-tier memory and thought generation system with source attribution metatags for enhanced AI consciousness.

## 🧠 Overview

EMA (Emergent Memory Architecture) implements a sophisticated memory system inspired by human cognition, featuring:

- **Three-tier memory system**: Echo (short-term), Working, and Permanent memories
- **Random thought generation**: Creative thoughts from 3-word seeds
- **Automatic salience extraction**: Identifies and saves important conversation segments
- **Source attribution**: Full provenance tracking for all information
- **Memory surfacing**: Both context-relevant and random memory retrieval

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/username/mcp-memory-ema.git
cd mcp-memory-ema

# Install dependencies
npm install

# Build the project
npm run build

# Install as system service (macOS)
./install-launchctl.sh
```

## 🔧 Configuration

### Option 1: System Service (Recommended for macOS)

The EMA server can run as a launchctl-managed service for automatic startup and process management:

```bash
# Install as service
./install-launchctl.sh

# Service management
launchctl start com.mcp.memory-ema    # Start service
launchctl stop com.mcp.memory-ema     # Stop service
launchctl list | grep memory-ema      # Check status

# View logs
tail -f ~/.ema/logs/ema-*.log
```

### Option 2: Manual MCP Configuration

Add to your MCP settings file (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "memory-ema": {
      "command": "node",
      "args": ["/path/to/mcp-memory-ema/dist/index.js"],
      "env": {}
    }
  }
}
```

## 📚 Available Tools

### `ema_process_conversation`
Process conversation segments for automatic memory extraction.

```typescript
{
  content: string,      // The conversation content
  speaker: 'user' | 'assistant',
  metadata?: object    // Optional source metadata
}
```

### `ema_generate_random_thought`
Generate a creative random thought from 3-word seeds.

### `ema_surface_relevant_memory`
Retrieve memories relevant to a given context.

```typescript
{
  context: string  // Context to search for
}
```

### `ema_surface_random_memory`
Surface a random memory from storage.

### `ema_store_memory`
Manually store a memory with full source attribution.

```typescript
{
  content: string,
  source: {
    origin: 'human' | 'search' | 'memory' | 'generated' | 'tool',
    confidence: number,  // 0.0 - 1.0
    timestamp: string,
    verification?: 'verified' | 'unverified' | 'partial'
  },
  tags?: string[]
}
```

### `ema_get_memory_stats`
Get statistics about stored memories.

### `ema_cleanup_memories`
Clean up old echo memories.

```typescript
{
  daysToKeep?: number  // Default: 7
}
```

## 🏗️ Architecture

### Memory Tiers

1. **Echo** - Short-term memories, automatically cleaned up
2. **Working** - Medium-term memories for current projects/sessions
3. **Permanent** - Long-term memories with high salience scores

### Salience Scoring

Memories are scored based on:
- Conceptual importance
- Emotional resonance
- Theoretical depth
- Surprise/novelty
- Pattern recognition
- Meta-cognitive awareness

### Source Attribution

Every memory includes metadata tracking:
- Origin (human, search, memory, generated, tool)
- Confidence level
- Timestamp
- Verification status
- Transformation history

### System Architecture

The MCP server runs as a system service managed by launchctl (macOS):
- Automatic startup on system boot
- Process supervision and restart on failure
- Centralized logging to `~/.ema/logs/`
- Resource throttling to prevent system overload

## 🧪 Development

```bash
# Run tests
npm test

# Run in development mode
npm run dev

# Run example
node full-demo.js

# Interactive CLI
npm run cli

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📊 Memory Database

Memories are stored in JSON format at `~/.ema/memories.json`. The database includes:
- Full memory content and metadata
- Source attribution chain
- Access patterns and statistics
- Inter-memory connections
- Random thoughts generated

### Storage Structure
```json
{
  "memories": [
    {
      "id": "uuid",
      "content": "Memory content",
      "timestamp": "ISO-8601",
      "salienceScore": 7.5,
      "tier": "working",
      "source": {
        "origin": "human",
        "confidence": 1.0,
        "timestamp": "ISO-8601"
      },
      "tags": ["memory", "consciousness"],
      "connections": ["other-memory-id"]
    }
  ],
  "randomThoughts": [
    {
      "id": "uuid",
      "seeds": ["word1", "word2", "word3"],
      "generated": "Creative thought",
      "timestamp": "ISO-8601",
      "ledToInsight": false
    }
  ]
}
```

## 🔮 Future Enhancements

- [ ] Vector embeddings for semantic search
- [ ] Memory decay and reinforcement
- [ ] Dream-like recombination during idle time
- [ ] Multi-conversation memory sharing
- [ ] Collaborative memory networks
- [ ] SQLite backend for larger datasets
- [ ] Ollama integration for enhanced thought generation

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 🐛 Troubleshooting

### Memory not persisting
- Check write permissions for `~/.ema/` directory
- Ensure service is running: `launchctl list | grep memory-ema`
- Check logs: `tail -f ~/.ema/logs/ema-stderr.log`

### Random thoughts not generating
- Verify configuration in MCP settings
- Check probability settings in config
- Review logs for errors

### Service issues (macOS)
```bash
# Reload service after changes
launchctl unload ~/Library/LaunchAgents/com.mcp.memory-ema.plist
launchctl load ~/Library/LaunchAgents/com.mcp.memory-ema.plist

# Check service logs
tail -f ~/.ema/logs/ema-*.log

# Remove service
launchctl unload ~/Library/LaunchAgents/com.mcp.memory-ema.plist
rm ~/Library/LaunchAgents/com.mcp.memory-ema.plist
```

### High memory usage
- Run cleanup tool regularly
- Adjust echo memory retention period
- Check for memory leaks in logs