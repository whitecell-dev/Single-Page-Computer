// Bytecode Virtual Machine for SPC
// Reusable runtime for executing compiled bytecode JSON

const fetch = require('node-fetch');

class BytecodeVM {
  constructor(bytecode) {
    this.bytecode = bytecode;
    this.state = JSON.parse(JSON.stringify(bytecode.state || {}));
  }

  async execute() {
    for (const inst of this.bytecode.instructions) {
      await this.executeInstruction(inst);
    }
    return this.state;
  }

  async executeInstruction(inst) {
    switch (inst.op) {
      case 'FETCH':
        try {
          const response = await fetch(inst.url);
          const data = await response.json();
          this.state[inst.outputKey] = data;
        } catch (e) {
          this.state[inst.outputKey + '_error'] = e.message;
        }
        break;

      case 'TRANSFORM':
        const input = this.state[inst.inputKey];
        if (!input) return;

        if (this.evaluateCondition(inst.condition, input)) {
          const result = {};
          for (const [key, expr] of Object.entries(inst.transforms || {})) {
            result[key] = this.resolveExpression(expr, input);
          }
          this.state[inst.outputKey] = { ...input, ...result };
        }
        break;

      case 'PROCESS':
        const processInput = this.state[inst.inputKey];
        if (!processInput) return;

        let result = processInput;
        for (const transform of inst.transforms || []) {
          if (this.evaluateCondition(transform.if, result)) {
            for (const [key, expr] of Object.entries(transform.then || {})) {
              result[key] = this.resolveExpression(expr, result);
            }
          }
        }
        this.state[inst.outputKey] = result;
        break;

      case 'MONITOR':
        const results = {};
        for (const check of inst.checks || []) {
          const data = this.state[check.dataKey];
          if (data) {
            const value = this.evaluateExpression(check.expression, data);
            const threshold = inst.thresholds[check.name] || {};
            results[check.name] = {
              value,
              status: this.evaluateThreshold(value, threshold),
            };
          }
        }
        this.state[inst.outputKey] = results;
        break;
    }
  }

  evaluateCondition(condition, context) {
    if (!condition || condition === true) return true;
    if (condition === false) return false;
    try {
      return new Function('data', `return ${condition}`)(context);
    } catch {
      return false;
    }
  }

  resolveExpression(expr, context) {
    if (typeof expr !== 'string') return expr;
    const match = expr.match(/^\{\{\s*(.*?)\s*\}\}$/);
    if (!match) return expr;
    try {
      return new Function('data', `return ${match[1]}`)(context);
    } catch {
      return expr;
    }
  }

  evaluateExpression(expr, data) {
    try {
      return new Function('data', `return ${expr}`)(data);
    } catch {
      return null;
    }
  }

  evaluateThreshold(value, t) {
    if (typeof t.above === 'number' && value >= t.above) return 'critical';
    if (typeof t.below === 'number' && value <= t.below) return 'critical';
    return 'ok';
  }
}

module.exports = BytecodeVM;

