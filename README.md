# 🖥️ Single Page Computer (SPC)

> **What if a single browser tab could act as a complete computer?**

The **Single Page Computer (SPC)** is a new architectural model that treats a web page not as a document, but as a **self-contained operating system**.  
Each SPC app packages **data**, **rules**, and a **UI** into a static HTML/JS file that runs entirely client-side — no backend, no servers, no frameworks.

---

## 🌐 Why SPC?

For decades, browsers were seen as **dumb terminals** connected to powerful servers. SPC flips that:  
the **browser itself becomes the runtime**.

An SPC application is structured like this:

- **Data (`data.json`)** → The state of the world. Pure JSON.  
- **Logic (`rules.axis`)** → Declarative rules for transforming state. Pure functions.  
- **UI (`index.html`)** → A static presentation layer. Just displays state and captures user input.  
- **Engine (`axis-rules.js`)** → The “CPU” that applies rules to data deterministically.  

Together, these create a **portable operating system in a tab**.

---

## ⚡ Key Properties

- **Zero Infrastructure** → Deploy to GitHub Pages, Netlify, or any static host.  
- **Deterministic** → Business logic is declarative and verifiable.  
- **User Sovereignty** → Data lives entirely in the browser (IndexedDB/localStorage).  
- **Portable** → Share an SPC with nothing more than a URL.  
- **Composable** → Swap out data, rules, or UI independently.  

---

## 🛠️ Examples

This repo is a **hub of SPC demos**. Each one lives in its own folder as a complete, static app.

### Mortgage Calculator
📂 [`/mortgage-calculator`](mortgage-calculator)  
A 19-rule loan decision engine that runs entirely in your browser.  
Features:
- Calculates combined income, LTV, PMI, interest rates
- Applies approval rules based on housing ratio, DTI, and credit score
- Produces audit trails and conditional approvals  
➡️ [Live Demo](https://yourusername.github.io/single-page-computer/mortgage-calculator)

---

### Order Processing Workflow
📂 [`/order-processing`](order-processing)  
An e-commerce pipeline demo with promotions, fraud checks, shipping logic, and loyalty points.  
➡️ [Live Demo](https://yourusername.github.io/single-page-computer/order-processing)

---

### Loyalty Points Engine
📂 [`/loyalty-points`](loyalty-points)  
A rules-driven loyalty system that upgrades tiers and awards bonuses deterministically.  
➡️ [Live Demo](https://yourusername.github.io/single-page-computer/loyalty-points)

---

(More examples coming soon: CRM, task tracker, inventory OS…)

---

## 🧩 Philosophy

SPC is built on the same ideas as [KERN](https://github.com/yourusername/kern) and [AXIS](https://github.com/yourusername/axis):

- **Rules = Programs**  
- **JSON = State**  
- **Browser = OS**  

This unlocks a **deterministic alternative** to JAMstack apps.  
Where JAMstack entangles UI, APIs, and AI at runtime, SPC keeps them **separated and declarative**.

---

## 🚀 Getting Started

Clone the repo and open any demo in your browser:

```bash
git clone https://github.com/yourusername/single-page-computer.git
cd single-page-computer/mortgage-calculator
open index.html

No build step. No install. Just open the file.

🧪 Roadmap
Add more SPC demos (CRM, task tracker, resume OS)
Document the SPC pattern like a design RFC
Explore integrations with MNEME
Provide a boilerplate template for new SPC apps

📜 License

MIT — open for experimentation, remixing, and extension.

💡 Inspiration

SPC takes inspiration from:

Unix philosophy → small, composable tools

jq / SQL → declarative data transformation

Web browsers → the world’s most universal runtime
