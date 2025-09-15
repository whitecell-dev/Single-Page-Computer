# AXIS Rules Engine — Demo UI

## 🌱 Overview

This project is a **work-in-progress prototype** that demonstrates how a **deterministic rules engine** can be given a simple user interface.

Think of it as a **UI layer for a deterministic LLM engine**:

* Instead of black-box model responses, you define explicit rules in YAML/JSON.
* The engine applies those rules step by step, with a **full audit trail** of every decision.
* The result is **transparent, reproducible reasoning** that anyone can inspect, modify, and rerun.

---

## ✨ Features

* **Input Editor**: Paste or edit structured input data (YAML or JSON).
* **Rules Editor**: Hidden by default — toggle with ⚙️ to view or edit rules directly.
* **Deterministic Execution**: Engine applies rules in priority order until convergence.
* **Audit Trail**: Full log of rules applied, including conflicts and state changes.
* **Debug Mode**: Step-by-step reasoning with safe context inspection.
* **Clear + Reset**: Quickly return to default classroom example or start fresh.

---

## 📊 Example Use Case

The default configuration models a **classroom**:

* Students have attendance, assignments, and behavior scores.
* Rules calculate:

  * Attendance rate
  * Assignment completion rate
  * Academic status (“excellent,” “good,” “needs\_support,” “at\_risk”)
  * Classroom-level averages

The output is deterministic, so anyone who runs the same input + rules gets the exact same results.

---

## 🛠️ How to Run

1. Open the HTML file in any modern browser.
2. Edit the **Input Data** panel with YAML/JSON.
3. Optionally, toggle **⚙️ Edit Rules** to view/modify rules.
4. Click **Run Engine Test** to execute.
5. Check **Engine Output** and **Execution Log** for results.

---

## 🚧 Work in Progress

* Persistence (localStorage, export/import) planned.
* Polished theming and multiple rule sets (e.g., finance, games, logistics).
* Cleaner conflict resolution and visualization.

---

## 🎯 Why It Matters

This demo shows how **deterministic reasoning** can be wrapped in a UI that feels approachable — like a lightweight LLM playground, but with full transparency and reproducibility.

It’s a step toward **auditable, user-controllable AI logic.**

---


