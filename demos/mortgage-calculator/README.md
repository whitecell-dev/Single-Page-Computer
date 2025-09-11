# AXIS Mortgage Calculator An interactive **Single Page Computer (SPC)** demo that applies the **AXIS Rules Engine** to simulate intelligent mortgage underwriting.  

This demo runs **entirely in the browser**, with no backend required. It evaluates mortgage applications using a **declarative ruleset (19 rules)**, covering:

- Household income & debt calculation  
- Credit score determination (including co-applicant logic)  
- Loan-to-value (LTV) and down payment validation  
- Risk-based interest rate adjustments  
- PMI (Private Mortgage Insurance) requirements  
- Monthly payment calculation (PITI + PMI + HOA)  
- Housing and debt-to-income ratio checks  
- Credit requirements & conditional approvals  
- Final approval determination with next steps  
- Closing costs & total cash needed  

---

## 🚀 Features

- **AXIS Rules Engine**  
  Pure JSON-in, JSON-out decision logic with fixpoint iteration, conflict resolution, and template expressions.  

- **19 Rule Mortgage Decision Engine**  
  Encodes typical mortgage underwriting guidelines in a declarative ruleset.  

- **Audit Trail**  
  Every rule applied is logged, showing *why* each transformation occurred.  

- **Interactive Inputs**  
  Change loan parameters via the form or JSON editor.  

- **Sample Scenarios**  
  Quickly test “Good Credit” and “Poor Credit” applications.  

---

## 📂 Project Structure

```text
.
├── index.html        # Main single-page demo (calculator + UI)
├── axis-rules.min.js # Minimal AXIS Rules Engine
├── data.json         # Example loan application input
├── rules.json        # Mortgage decision ruleset (19 rules)
└── README.md

📝 Usage
Run in Browser

Clone repo:
git clone https://github.com/yourname/axis-mortgage-calculator
cd axis-mortgage-calculator

Open index.html in your browser.

CodePen Demo

Copy contents of index.html and axis-rules.min.js into a CodePen project.

🔮 Extending

Swap in new rules.json for different underwriting strategies.

Use the engine for other decision-heavy domains (insurance, healthcare, logistics).

Integrate with React, Vue, or Svelte to make a reusable SPC component.

📜 License

MIT License © AXIS Project
