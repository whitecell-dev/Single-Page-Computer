# 🧬 Origins of the Single Page Computer (SPC)

> **Where did the idea come from, and why now?**

The **Single Page Computer (SPC)** is not just another framework or front-end toy — it’s the convergence of **two historical threads**: the evolution of the **browser as an operating system**, and the rise of **declarative, text-based logic** as the universal substrate of computing.

---

## Thread 1: The Evolution of the Browser 🖥️

### 1990s — The Document Viewer Era

* Browsers like **Netscape** and **Mosaic** were essentially PDF readers for HTML.
* Core stack: HTML (markup) + CSS (styling) + a sprinkle of JavaScript.
* Any real application required a backend:

  * PHP, Perl, or Rails servers
  * Databases
  * Paid hosting and infrastructure management
* Browser = thin window onto server-side computation.

### 2000s — The Application Runtime Era

* JavaScript matured, AJAX made asynchronous updates possible.
* Led to "Rich Internet Applications" like **Gmail** and **Google Maps**.
* But the browser was still a client — **all real logic lived on the server**.

### 2010s — The Single-Page Application (SPA) Era

* Frameworks like **React, Angular, Vue** popularized SPAs.
* The browser now rendered complex UIs, updated via virtual DOMs.
* But SPAs were still tethered to backend APIs, databases, and build pipelines.
* Browser = a rich canvas, but still a thin client.

### 2020s — The Self-Contained Computer Era

* Browsers now support:

  * **IndexedDB / localStorage** (persistent client-side DB)
  * **Service Workers** (offline caching)
  * **WASM** (near-native execution)
* This makes the browser capable of **hosting a full application stack**:

  * State → JSON in storage
  * Logic → DSL-driven rules engines
  * UI → Plain HTML/CSS
* The browser itself becomes a **sovereign operating system**.

**SPC is the natural next step**: a page that is not just a document or app, but a **self-contained computer.**

---

## Thread 2: The Rise of Declarative Logic 📝

### 1930s — Theoretical Foundation

* **Alonzo Church**: Lambda Calculus (functions, immutability)
* **Alan Turing**: State machines (instructions, transitions)
* Different paradigms, but equivalent in computational power.

### 1970s–1990s — Functional Programming & DSLs

* Languages like **Lisp, ML, Haskell** emphasized pure functions.
* **Domain-Specific Languages (DSLs)** emerged:

  * `grep`, `awk` → text search/processing
  * **SQL** → declarative data queries
* These DSLs abstracted *what* over *how*, turning intent into deterministic execution.

### 2000s–2010s — JSON & YAML as Universal Data

* **JSON** became the lingua franca of APIs.
* **YAML** emerged as the human-readable superset.
* Both formats treat **text as structured state** — legible to humans *and* machines.

### Today — AXIS & SPC

* SPC fuses these threads into a portable runtime:

  * **JSON** = state
  * **YAML/AXIS rules** = logic
  * **Browser** = OS
* The **AXIS rules engine** plays the role of SQL-for-the-browser, deterministically transforming state inside a tab.

---

## Why This Matters 🚀

The **existence of a lightweight, text-based DSL for data transformation** is the key unlock:

* It collapses infrastructure: no backend required.
* It guarantees determinism: same rules → same results.
* It makes apps portable: a single file = a whole computer.

Where JAMstack apps still tie UI to APIs, SPC apps remain **self-contained, auditable, and remixable**. A Git repo becomes a software distribution channel. A GitHub Pages deployment becomes an OS.

---

## SPC = The nvim of the Browser

SPC stands in the same philosophical lineage as **nvim**:

* **Text-first**: everything is rules, JSON, YAML
* **Deterministic**: rules applied consistently to state
* **Composable**: swap data/rules/UI freely
* **Sovereign**: no lock-in, no backend, no hidden runtime

Where **nvim** turned the terminal into an OS, SPC turns the browser into one.

---

## Practical Notes

### Working with Single Files vs. Split Projects

* For small SPC demos: everything (state, rules, engine, UI) can live in one HTML file.
* Beyond \~300 lines: split into modules (`engine.js`, `rules.yaml`, `data.json`) to avoid complexity.
* SPC is **AI-native**: LLMs can generate, edit, or remix SPC files directly because they are just text.

### Hosting on GitHub Pages

GitHub Pages makes SPC trivial to deploy:

* **Free hosting** for static HTML/JS apps
* **Client-side storage** (localStorage/IndexedDB)
* **Offline support** (Service Workers)
* **Auto-deploy** on `git push`
* **CDN distribution** with HTTPS by default
* **Version control** → full auditability

### Offline Use

Two approaches:

1. **Service Worker** → Cache all app resources for full offline mode.
2. **Save-as-HTML** → Users can download the entire SPC as a single file and run it offline.

---

## 📜 License

MIT — free to build, remix, and extend.

---

**SPC is the culmination of decades of computing philosophy.** It collapses the browser + declarative logic into a portable OS you can share with nothing more than a URL.

