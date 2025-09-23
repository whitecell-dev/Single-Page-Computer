# 🖥️ Single Page Computer (SPC)
**WordPress Moment for Apps.**

The nvim of the browser.A single tab becomes a complete computer: state, logic, and UI — all in text.

---
## What SPC Does

### WordPress Moment for Apps:

Before WordPress: “I need a website” → hire a developer.

After WordPress: “I need a website” → click install.

Today: “I need an app” → hire a developer.

After SPC: “I need an app” → describe it, run it, share it.

TikTok for Apps: apps become lightweight, remixable, instant.

AI-Native: SPC files are simple enough that LLMs can generate them reliably.
---

## 🌐 The Browser Evolution

### Before Static Hosting (Pre-2016)

```
Browser = Document Viewer
├── HTML (static markup)
├── CSS (styling)
└── JS (basic interactivity)

Real Applications Required:
├── Backend Server (PHP/Rails/Node)
├── Database
├── Paid Hosting
└── Infrastructure Management
```

### After GitHub Pages Era (2016+)

```
Browser = Application Runtime
├── React SPAs (bundled)
├── JAMstack + APIs
├── Client-side Games
└── Static Site Generators

But Still Dependent On:
├── External APIs
├── Build Processes
├── Backend Services
└── Network Connectivity
```

### SPC Era (Now)

```
Browser = Self-Contained Computer
├── State (JSON files)
├── Logic (YAML/AXIS rules)
├── Engine (deterministic execution)
└── UI (thin rendering layer)

Zero Dependencies:
├── No backend required
├── No build process
├── No external APIs
└── Runs offline
```
## The SPC Stack

| Layer                   | Role                                 | Analogy               |
| ----------------------- | ------------------------------------ | --------------------- |
| **SPC**                 | Self-contained app unit              | WordPress site / post |
| **Deck.Shell**          | Runtime that renders SPCs            | Web browser           |
| **MicroService OS**     | Dashboard / launcher / marketplace   | WordPress admin panel |
| **GitHub Pages + IPFS** | Free hosting & distribution          | Hosting/CDN           |
| **AXIS**                | Declarative runtime for SPC rules    | Node.js               |
| **KERN**                | Compiler layer for polyglot backends | Babel/LLVM            |
| **MNEME**               | Verifiable state / provenance        | Git + database hybrid |

🧩 Why This Matters

Zero Dependencies: No backend, no build, no SaaS fees.

Self-Contained: Entire app in one file or folder.

Remixable: Edit a JSON/YAML rule → new app.

Verifiable: Runs on IPFS, hash-addressed, provenance baked in.

Scalable: From tip trackers to CRMs to agent workflows.

---

## 📏 Scaling Beyond a Single File

An SPC can live entirely in **one HTML file**. That makes demos, distribution, and sharing dead simple.

But once you cross a few hundred lines, a monolithic file becomes unmanageable.

**Recommended Split Strategy**:

* `index.html` → UI shell (minimal HTML)
* `engine.js` → SPC rules engine
* `rules.yaml` → Declarative logic
* `data.json` → Application state
* `app.js` → Glue code (wiring engine + UI)
* `sw.js` → Optional Service Worker for offline

This preserves the “single-file magic” for tiny apps but keeps larger SPC projects sane and collaborative.

---

## 🤖 SPC is AI-Native

SPC is designed for the **AI era**:

* **Rules as prompts**: JSON/YAML rules are simple enough for LLMs to read and generate.
* **Composable logic**: Instead of black-box code, SPC apps expose human-readable rules.
* **Offline-first**: Lightweight enough to run with local or edge models.
* **Interpretable by design**: Deterministic execution means every AI-suggested change can be replayed and audited.

**Core Idea**: AI doesn’t replace SPC — it becomes your **co-pilot for editing rules and generating apps**.

---

## 📝 Why Text-as-Computer Changes Everything

SPC treats **text files as computational primitives**:

| Component     | Format       | Purpose                       |
| ------------- | ------------ | ----------------------------- |
| **State**     | `data.json`  | The world as data             |
| **Logic**     | `rules.yaml` | Deterministic transformations |
| **Engine**    | `axis.js`    | Execution runtime             |
| **Interface** | `index.html` | Thin rendering layer          |

This separation enables:

* **Hot-edit logic** without redeploying
* **Version control** your entire application
* **Deterministic execution** across any browser
* **Zero infrastructure** dependencies

Think `vim + jq + SQLite` running entirely in a browser tab.

---

## 🔮 SPC = nvim for the Browser

### Text-First Philosophy

* **nvim**: "Everything is a text file"
* **SPC**: "Everything is JSON/YAML rules"

### Deterministic Core

* **nvim**: Keystrokes → predictable buffer transformations
* **SPC**: Rules → deterministic state transformations

### Composable Architecture

* **nvim**: Plugins extend core functionality
* **SPC**: Rule sets define application behavior

### User Sovereignty

* **nvim**: Runs on your terminal, dotfiles define behavior
* **SPC**: Runs in your browser, text files define logic

### Lightweight Runtime

* **nvim**: Minimal editor that becomes whatever you need
* **SPC**: Minimal engine that becomes whatever you define

**Core Insight**: Both collapse complex infrastructure into portable, text-based environments that users fully control.

---

## 🌍 How GitHub Pages Works for SPC Applications

GitHub Pages is more powerful than it looks:

### Capabilities

* **Full JavaScript Applications**: Host SPC engines, not just static HTML.
* **Client-Side Storage**: Persist data with `localStorage` or IndexedDB.
* **Offline Functionality**: Add a Service Worker so SPC runs without internet.
* **Automatic Deployment**: Every push to `main` updates the live app.

### Addressing Offline Use

* **Service Worker Approach**: Cache resources for full offline PWA experience.
* **Simple Download Approach**: Users can “Save Page As…” to keep a working local copy.

### Key Advantages

* **Zero Cost**: Free hosting, forever.
* **Simple Deployment**: Push code → live in seconds.
* **Automatic HTTPS**: Secure by default.
* **Global CDN**: Fast worldwide delivery.
* **Version Control**: Every iteration is tracked.

👉 This makes GitHub Pages the **ideal platform for SPC**: simple, free, and perfectly matched to SPC’s philosophy of **text-first, self-contained computing**.

---

## 📦 SPC + IPFS

SPC applications are a **perfect match for IPFS** (InterPlanetary File System):

### Why IPFS?

* **Content-Addressed** → Every SPC (logic + state + UI) can be pinned to a unique hash.
* **Decentralized Distribution** → No central server or app store. Anyone can host/share.
* **Permanent Apps** → An SPC published to IPFS is immutable and retrievable forever.
* **Verifiable by Default** → The hash itself guarantees integrity.

### Workflow

1. **Build your SPC** → Single file or split project.
2. **Publish to IPFS** → `ipfs add spc-app.html`
3. **Get a Hash** → Example: `QmXyz123...`
4. **Share & Remix** → Anyone can fetch your SPC with:

   ```bash
   ipfs get QmXyz123...
   ```

### Advantages Over Traditional Hosting

* No servers, no domains, no SSL certificates.
* Apps are **portable artifacts** → just like MP3s or PDFs.
* Remix culture: fork any SPC, edit rules, re-publish with a new hash.
* Ideal for **offline-first** and **AI-generated apps** that need instant distribution.

### Example

```bash
# Add SPC app to IPFS
ipfs add spc-app.html

# Output
added QmXyz123456789abcdef spc-app.html

# Retrieve SPC app anywhere
ipfs get QmXyz123456789abcdef
```

With GitHub Pages you get zero-cost static hosting.
With IPFS you get **decentralized, permanent, verifiable applications.**

Together, they form the **WordPress for Apps stack**.

---
            ┌─────────────────┐
            │   SPC Project   │
            └────────┬────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐        ┌───────▼────────┐
│ GitHub Pages   │        │ IPFS           │
│ - Free hosting │        │ - Hash address │
│ - Easy deploy  │        │ - Permanent    │
│ - Global CDN   │        │ - Verifiable   │
└────────────────┘        └────────────────┘
        │                         │
        ▼                         ▼
   `myspc.github.io`        `ipfs://QmXyz...`

--

## 🧩 Live Examples

### Financial Analytics Engine

**Demo**: [Portfolio Analyzer](https://example.com/portfolio)

* Real-time ROI calculations
* Risk assessment algorithms
* Performance tracking
* *Runs entirely client-side*

### Workflow Automation

**Demo**: [Order Processing](https://example.com/orders)

* Multi-step approval workflows
* Conditional business logic
* State machine execution
* *No backend required*

### Interactive Presentations

**Demo**: [PowerPoint++](https://example.com/slides)

* Programmable slide logic
* Embedded mini-applications
* Live rule editing
* *Portable as single file*

---

## ⚙️ Quick Start

```bash
# Clone any SPC application
curl -O https://example.com/spc-app.html

# Open in browser
open spc-app.html

# Edit the rules
vim spc-app.html  # Find <script type="application/yaml">
```

That’s it. No installation. No build step. **Just text.**

---

## 📜 The SPC Pattern

Every SPC application follows this structure:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My SPC App</title>
  <script src="https://cdn.jsdelivr.net/npm/axis-engine"></script>
</head>
<body>
  <div id="app"></div>
  
  <script type="application/yaml" id="rules">
    rules:
      - name: "calculate_total"
        when: "items.length > 0"
        then:
          total: "{{ items.reduce((sum, item) => sum + item.price, 0) }}"
  </script>
  
  <script type="application/json" id="data">
    {
      "items": [],
      "total": 0
    }
  </script>
  
  <script>
    const engine = new AxisEngine();
    engine.loadRules(document.getElementById('rules').textContent);
    engine.loadData(JSON.parse(document.getElementById('data').textContent));
    engine.render(document.getElementById('app'));
  </script>
</body>
</html>
```

**Key Properties**:

* Self-contained (single file)
* Human-readable (all text)
* Version-controllable (Git-friendly)
* Deterministic (same input = same output)
* Portable (runs anywhere with a browser)

---

## 🧠 Philosophical Foundation

SPC embodies three principles:

1. **Text as Universal Interface** → Like nvim’s buffers, SPC treats text as the abstraction layer.
2. **Deterministic Execution** → Rules yield exact state transformations.
3. **User Sovereignty** → No cloud lock-in, no server dependency.

---

## 🧪 Roadmap

* Formalize AXIS rule syntax specification
* Add MNEME for verifiable state logging
* Release SPC debugging extension
* Publish boilerplate SPC templates

---

## 🌟 Inspiration

SPC synthesizes:

* **Unix Philosophy** → Small, composable, text tools
* **nvim** → Text-first extensible computing
* **Functional Programming** → Deterministic transforms
* **Web Standards** → Universal browser runtime

The result: **a portable operating system that fits in a single file.**

---

## 📄 License

MIT — Build, remix, and extend freely.




