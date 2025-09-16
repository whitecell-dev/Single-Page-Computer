*** AXIS Financial Analytics Engine

A zero-backend, browser-only analytics “mini-platform” for portfolios.
Import a CSV → apply declarative YAML rules → get clean outputs, charts, and a full audit trail.
Free to host on GitHub Pages. No builds. No logins. No vendor lock-in.

> **Not investment advice.** This project is for information/education only.

---

## Table of Contents

* [Features](#features)
* [Live Demo](#live-demo)
* [Quick Start](#quick-start)
* [Data Formats](#data-formats)

  * [CSV Schema](#csv-schema)
  * [YAML/JSON Input](#yamljson-input)
* [Rules Engine](#rules-engine)

  * [How Rules Work](#how-rules-work)
  * [Sample Rules](#sample-rules)
* [Visualizations](#visualizations)
* [Exporting](#exporting)
* [Project Structure](#project-structure)
* [Deploy (GitHub Pages)](#deploy-github-pages)
* [Extending](#extending)
* [Privacy & Security](#privacy--security)
* [Limitations](#limitations)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)

---

## Features

* **CSV-native workflow**: Import portfolio instrument data (stocks/ETFs/crypto), process, and export back to CSV.
* **Declarative analytics**: Finance metrics defined in human-readable **YAML rules** (version-controllable).
* **Charts included**: Allocation, performance, risk radar, trend distribution, and per-instrument sparklines (Chart.js).
* **Auditability**: Full execution trail (what ran, in what order, what changed).
* **Client-side only**: Works fully in the browser; easy to host on **GitHub Pages**.
* **Zero install**: A single `index.html` with CDN scripts (`js-yaml`, `PapaParse`, `Chart.js`).

---

## Live Demo

* **GitHub Pages URL:** `https://<your-username>.github.io/<your-repo>/`
  *(Fill in after deploying—see [Deploy](#deploy-github-pages).)*

---

## Quick Start

1. **Clone or copy** this repo locally.
2. Open `index.html` in your browser.
3. Click **Sample Portfolio** to load demo data **or** click **📁 Import Portfolio CSV** to load your CSV.
4. Click **Run Analytics**.
5. Explore:

   * **Results** tab → YAML output + audit summary
   * **Visualizations** tab → charts and summary cards
   * **Export** → CSV of instrument results

> All data stays in your browser. Sessions persist using `localStorage`.

---

## Data Formats

### CSV Schema

Your CSV should include columns similar to:

```csv
symbol,name,type,sector,open,close,high,low,volume,shares_held,units_held,historical_closes
AAPL,Apple Inc.,stock,Technology,150.00,155.50,157.20,149.80,2500000,100,,"[148.50,149.20,151.30,153.10,155.50]"
TSLA,Tesla Inc.,stock,Automotive,220.00,215.75,225.40,214.90,1800000,50,,"[218.30,220.10,222.40,218.90,215.75]"
BTC,Bitcoin,crypto,Cryptocurrency,42000.00,43500.00,44200.00,41800.00,850000,,0.5,"[41500.00,41800.00,42300.00,42800.00,43500.00]"
SPY,SPDR S&P 500 ETF,etf,Broad Market,420.50,425.20,426.80,419.30,3200000,200,,"[418.90,420.10,422.30,424.60,425.20]"
```

* **Required-ish**: `symbol`, `open`, `close`
* **Position**: use `shares_held` for equities/ETFs, `units_held` for crypto.
* **History**: `historical_closes` can be a JSON array string or comma-separated numbers.

> The parser is forgiving—unknown columns are kept, numbers are auto-typed where possible.

### YAML/JSON Input

Internally the app stores your data like:

```yaml
portfolio:
  name: "Diversified Growth Portfolio"
  manager: "AXIS Analytics"
  date: "YYYY-MM-DD"
  cash_balance: 50000
  risk_free_daily: 0.0001  # optional, used for Sharpe
instruments:
  - symbol: "AAPL"
    type: "stock"
    open: 150
    close: 155.5
    shares_held: 100
    historical_closes: [148.5, 149.2, 151.3, 153.1, 155.5]
  # ...
```

You can paste YAML/JSON directly into the **Portfolio Data** editor.

---

## Rules Engine

### How Rules Work

* Rules are declared in YAML under `financialRules.rules`.
* Each rule has:

  * `name`: identifier
  * `priority`: lower runs first
  * `if`: a JS expression evaluated against the current state
  * `then`: object mapping of **dot-paths** → values
* Values can be literal or **template expressions** using `{{ ... }}` (in-browser JS, sandboxed context).

Execution proceeds in prioritized passes until state converges or `max_iterations` is reached.

### Sample Rules

**Daily % change, 5-day MA, volatility, trend, position value, portfolio metrics** (core set):

```yaml
- name: calculate_percentage_change
  priority: 1
  if: "instruments && instruments.length > 0"
  then:
    "instruments": "{{instruments.map(i => ({...i, pct_change: Math.round(((i.close - i.open) / i.open) * 10000) / 100}))}}"

- name: calculate_5day_moving_average
  priority: 2
  if: "instruments && instruments.length > 0"
  then:
    "instruments": "{{instruments.map(i => ({...i, ma_5day: i.historical_closes && i.historical_closes.length >= 5 ? Math.round((i.historical_closes.reduce((s,p)=>s+p,0)/i.historical_closes.length)*100)/100 : null}))}}"

- name: calculate_volatility
  priority: 3
  if: "instruments && instruments.length > 0"
  then:
    "instruments": "{{instruments.map(i => { if (!i.historical_closes || i.historical_closes.length < 2) return {...i, volatility: null}; const m = i.historical_closes.reduce((s,p)=>s+p,0)/i.historical_closes.length; const v = i.historical_closes.reduce((s,p)=>s+Math.pow(p-m,2),0)/i.historical_closes.length; return {...i, volatility: Math.round(Math.sqrt(v)*100)/100}; })}}"

- name: assign_trend_status
  priority: 4
  if: "instruments && instruments.length > 0"
  then:
    "instruments": "{{instruments.map(i => ({...i, trend_status: i.pct_change > 2 ? 'bullish' : i.pct_change < -2 ? 'bearish' : 'neutral'}))}}"

- name: calculate_position_values
  priority: 5
  if: "instruments && instruments.length > 0"
  then:
    "instruments": "{{instruments.map(i => { const q = i.shares_held || i.units_held || 0; return {...i, position_value: Math.round(i.close * q * 100)/100}; })}}"

- name: calculate_portfolio_metrics
  priority: 10
  if: "instruments && instruments.length > 0"
  then:
    "portfolio.total_instruments": "{{instruments.length}}"
    "portfolio.total_value": "{{Math.round(instruments.reduce((s,i)=>s+(i.position_value||0),0)*100)/100}}"
    "portfolio.avg_daily_change": "{{Math.round(instruments.reduce((s,i)=>s+(i.pct_change||0),0)/instruments.length*100)/100}}"
    "portfolio.bullish_count": "{{instruments.filter(i=>i.trend_status==='bullish').length}}"
    "portfolio.bearish_count": "{{instruments.filter(i=>i.trend_status==='bearish').length}}"
    "portfolio.high_risk_count": "{{instruments.filter(i=>i.volatility>50).length}}"
```

**Sharpe, max drawdown, correlation vs benchmark** (enhanced):

```yaml
- name: compute_daily_stats_sharpe_mdd
  priority: 7
  if: "instruments && instruments.length > 0"
  then:
    "instruments": "{{instruments.map(i => {
      const px = i.historical_closes || [];
      if (px.length < 2) return {...i, daily_returns: [], sharpe: null, max_drawdown: null};
      const rets = px.slice(1).map((p,k)=>(p/px[k]-1));
      const mean = rets.reduce((s,x)=>s+x,0)/rets.length;
      const variance = rets.reduce((s,x)=> s+Math.pow(x-mean,2),0)/rets.length;
      const stdev = Math.sqrt(variance);
      const rf = (portfolio && portfolio.risk_free_daily) ? portfolio.risk_free_daily : 0;
      const sharpe = stdev ? (mean - rf)/stdev : null;
      let peak = px[0], mdd = 0; for (const p of px){ peak = Math.max(peak,p); mdd = Math.min(mdd,(p-peak)/peak); }
      return {...i, daily_returns: rets, sharpe: sharpe!=null?Math.round(sharpe*100)/100:null, max_drawdown: Math.round(mdd*10000)/100};
    })}}"
    "portfolio.risk_free_daily": "{{portfolio && portfolio.risk_free_daily !== undefined ? portfolio.risk_free_daily : 0}}"

- name: corr_vs_benchmark
  priority: 8
  if: "instruments && instruments.length > 1"
  then:
    "portfolio.corr_vs_benchmark": "{{(() => {
      const ins = instruments.filter(i => i.daily_returns && i.daily_returns.length > 1);
      const bench = ins.find(i => i.symbol === 'SPY') || ins[0];
      function corr(a,b){
        const n=Math.min(a.length,b.length), ar=a.slice(-n), br=b.slice(-n);
        const ma=ar.reduce((s,x)=>s+x,0)/n, mb=br.reduce((s,x)=>s+x,0)/n;
        let num=0, da=0, db=0;
        for(let i=0;i<n;i++){ const xa=ar[i]-ma, xb=br[i]-mb; num+=xa*xb; da+=xa*xa; db+=xb*xb; }
        return (da&&db)?Math.round((num/Math.sqrt(da*db))*100)/100:null;
      }
      const out={}; for (const i of ins) out[i.symbol]=corr(i.daily_returns, bench.daily_returns); out.benchmark=bench.symbol; return out;
    })()}}"
```

---

## Visualizations

The **Visualizations** section renders:

* **Portfolio allocation** (pie)
* **Daily performance** by instrument (bar)
* **Volatility comparison** (radar)
* **Trend distribution** (doughnut)
* **Per-instrument price trend** (line sparkline using `historical_closes`)

All charts are powered by **Chart.js** via CDN.

---

## Exporting

* **Export Results to CSV**: Converts the instrument-level results (including calculated fields) into a CSV download.
* YAML results remain visible in the **Results** panel for copy/paste or saving elsewhere.

---

## Project Structure

```
index.html   # All HTML/CSS/JS in one file for easy hosting
```

**External libraries (via CDN):**

* `js-yaml` – YAML parsing/serialization
* `PapaParse` – CSV parsing/unparsing
* `Chart.js` – charts

No build step, no package.json required.

---

## Deploy (GitHub Pages)

1. Create a new GitHub repo and add `index.html`.
2. **Settings → Pages**:

   * Source: `Deploy from a branch`
   * Branch: `main` (or `master`), folder: `/ (root)`
3. Save. Your app will be live at
   `https://<username>.github.io/<repo>/`

Tip: Add a `README.md` (this file) to your repo’s root.

---

## Extending

* **Add metrics**: Append rules to `financialRules.rules`. Use `priority` to control order.
* **Add charts**: In `createVisualizations(result)`, create a `<canvas>` and instantiate a new `Chart(...)`.
* **New data sources**: Transform any CSV headers to friendly keys (the importer lowercases & trims keys).
* **Default scenarios**: Add more demo presets (e.g., bull run, bear shock) in the “Actions” sidebar to tell better stories.

---

## Privacy & Security

* **Local-only**: All computation happens in the browser. Data persists to `localStorage` on your machine.
* **No servers**: GitHub Pages serves static files; your portfolio data is never uploaded unless you choose to.
* **Template eval**: Rules use in-page JS expressions. Only use rule files you trust.

---

## Limitations

* **No real-time data**: You import CSVs; there’s no market feed included.
* **Eval context**: While sandboxed to app state and standard JS built-ins, expressions are still JavaScript—validate rules before sharing.
* **Large CSVs**: Browser memory/CPU can be a constraint with very large datasets.

---

## Roadmap

* Optional **PWA** (installable + offline cache)
* Pluggable **benchmarks** and factor exposures
* Multi-portfolio comparison
* Scenario analysis & stress testing helpers
* Report generator (PDF/Markdown)

---

## Contributing

Issues and PRs welcome!

* Keep the **no-build** constraint where possible (single-file simplicity).
* Add rules with clear names, safe guards (null checks), and comments.
* Include a small sample CSV for any new feature.

---

## License


* **MIT**


---

### Credits

* Rules engine & UI scaffolding: AXIS
* CSV: PapaParse
* YAML: js-yaml
* Charts: Chart.js

---

> *“Upload a CSV. Get portfolio analytics, charts, and an audit trail—right in your browser. Free to host, easy to extend.”*

