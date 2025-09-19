# 🌲 AXIS CLI — Tree-OS Command Line Runtime

**AXIS CLI** is the headless runtime for executing **SPC (Service Portable Container)** files.  
It runs portable logic trees (JSON/YAML) in your terminal — no servers, no infra, just files.  

- **Deck-Shell** → visual dashboard (browser)  
- **AXIS CLI** → engineer’s runtime (terminal)  

Both share the same SPC format and engine.

---

## 🚀 Installation

```bash
npm install -g @tree-os/axis-cli

Verify installation:

axis --version

⚡ Quick Start
Run once

axis run examples/bitcoin.spc.json --pretty

Watch (continuous polling)

axis watch examples/bitcoin.spc.json --interval 5000

Interactive REPL

axis repl
> load examples/bitcoin.spc.json
> services.list()
> state.get('btc_data')
> run btc-price
> state.all()

Export state

# Export just the state
axis export examples/bitcoin.spc.json --state-only > state.json

# Export full SPC
axis export examples/bitcoin.spc.json --pretty > exported.spc.json

Hash SPC

axis hash examples/bitcoin.spc.json
# → sha256 hash

Dry run

axis dry-run examples/bitcoin.spc.json
# Lists which services would execute without running them

📦 SPC File Example

{
  "spc_version": "1.0",
  "meta": {
    "name": "bitcoin-tracker",
    "author": "examples@tree-os.com"
  },
  "services": {
    "btc-price": {
      "type": "connector",
      "title": "Bitcoin Price Feed",
      "spec": {
        "url": "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
        "outputKey": "btc_data"
      }
    },
    "price-check": {
      "type": "monitor",
      "title": "Price Monitor",
      "spec": {
        "checks": [
          {
            "name": "price",
            "dataKey": "btc_data",
            "expression": "data.bitcoin.usd"
          }
        ],
        "thresholds": {
          "price": {
            "above": 100000,
            "below": 20000
          }
        }
      }
    }
  },
  "state": {}
}

🔧 Service Types

    connector → fetches data from external APIs

    processor → transforms data with rules

    monitor → evaluates thresholds & conditions

    interface → handles UI/inputs (CLI stub, Deck-Shell full)

🛠 Development

# Clone repo
git clone https://github.com/tree-os/axis-cli
cd axis-cli

# Install deps
npm install

# Run test example
node bin/axis.js run examples/bitcoin.spc.json --pretty

📝 License

MIT — see LICENSE




