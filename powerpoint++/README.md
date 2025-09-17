# PowerPoint++ — LLM-Native App Deck OS

**A browser-native runtime for declarative applications.**

PowerPoint++ transforms how we build, share, and execute interactive applications. Write logic in JSON/YAML, render it as live apps, generate it with LLMs, and run it anywhere with zero infrastructure.

```
Traditional Stack:          PowerPoint++:
┌─────────────────┐          ┌─────────────────┐
│ React Frontend  │          │ JSON Slides     │
│ Node.js Backend │    →     │ Logic Engine    │
│ Database        │          │ Browser Runtime │
│ Server Deploy   │          │ Single File     │
└─────────────────┘          └─────────────────┘
```

## Core Architecture

### Slides as Micro-Applications

Each slide is a self-contained application defined by JSON rules:

```json
{
  "id": "roi-calc",
  "type": "interactive", 
  "title": "ROI Calculator",
  "rules": {
    "inputs": [
      {"name": "initial", "label": "Initial Investment", "type": "number", "default": 1000},
      {"name": "final", "label": "Final Value", "type": "number", "default": 1200}
    ],
    "calculation": "((inputs.final - inputs.initial) / inputs.initial) * 100",
    "result_format": "ROI: {result}%"
  }
}
```

### Slide Types

- **`static`** — Content and documentation
- **`interactive`** — Forms, calculators, input processors  
- **`game`** — Logic-driven interactive experiences
- **`spc`** — API fetchers with rule-based transformations
- **`agent`** — LLM-generated or self-modifying slides

### Decks as Applications

A deck is a portable app bundle — an array of slides with shared state:

```json
{
  "meta": {"title": "Financial Tools", "version": 1},
  "slides": [
    {"id": "intro", "type": "static", "rules": {...}},
    {"id": "calculator", "type": "interactive", "rules": {...}},
    {"id": "api-data", "type": "spc", "rules": {...}}
  ]
}
```

## Key Features

### LLM-Native Authoring
- Generate slides from natural language descriptions
- AI agents can create and modify their own interfaces
- Human-readable JSON that LLMs understand natively

### Zero Infrastructure  
- Runs entirely in browser with no backend required
- Auto-saves to localStorage
- Import/export as single JSON files
- Offline-capable applications

### Live Logic Engine
- Evaluates `{{ expressions }}` in real-time
- Reactive state management
- Rule-based transformations
- API integration with response processing

## Use Cases

**Internal Tools**
- Custom dashboards and admin panels
- Compliance calculators and checklists
- Team utilities and workflow automation

**Education & Training**
- Interactive tutorials with embedded logic
- Assessment tools with dynamic scoring
- Concept visualization with live examples

**Developer Tools**
- API testing and visualization interfaces
- Configuration generators
- Debug dashboards with real-time data

**LLM Applications**
- AI agents that render custom interfaces
- Dynamic form generation from requirements
- Self-explaining applications with embedded context

## Quick Start

```bash
# Clone or download the HTML file
curl -O https://example.com/powerpoint-plus.html

# Open in browser
open powerpoint-plus.html

# Start building slides with JSON
```

No build process. No installation. Just open and use.

## API Integration Example

```json
{
  "type": "spc",
  "rules": {
    "init": {"price": 0, "status": "unknown"},
    "fetch": {
      "url": "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    },
    "rules": {
      "rules": [
        {
          "name": "categorize_price",
          "if": "price > 0", 
          "then": {
            "status": "{{ price > 100000 ? 'moon' : price > 50000 ? 'expensive' : 'cheap' }}"
          }
        }
      ]
    }
  }
}
```

This fetches Bitcoin prices and applies business logic to categorize them, all declared in JSON.

## Development Philosophy

### Apps Should Be Declarative
Complex behavior emerges from simple, composable rules rather than imperative code.

### Logic Should Be Inspectable  
All application behavior is visible as human-readable text, not hidden in compiled binaries.

### LLMs Should Generate Structure
AI systems can author, modify, and explain applications by manipulating structured data.

### Users Should Own Execution
Applications run locally under user control without dependencies on external services.

## Roadmap

### Near Term
- Plugin API for custom slide types
- Deck registry and sharing system  
- Enhanced LLM integration for slide generation
- Theme system and visual customization

### Future Vision
- Compile decks to WebAssembly, Lua, or native code
- Hardware integration (RISC-V, embedded systems)
- Blockchain verification layer (MNEME audit trails)
- Desktop runtime for offline applications

## Technical Foundation

PowerPoint++ implements the Single Page Computer (SPC) pattern:

- **Text-based definitions** replace compiled code
- **Deterministic execution** ensures predictable behavior  
- **Client-side evaluation** eliminates server dependencies
- **Rule-based logic** enables LLM generation and modification

This represents a fundamental shift from infrastructure-dependent applications to portable, declarative computing environments.

## License

MIT — Build, remix, and extend freely.
