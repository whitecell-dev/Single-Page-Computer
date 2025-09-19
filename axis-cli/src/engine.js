const fetch = require('node-fetch');

class SPCEngine {
  constructor() {
    this.state = {};
    this.services = {};
    this.meta = {};
  }

  load(spc) {
    this.services = spc.services || {};
    this.state = spc.state || {};
    this.meta = spc.meta || {};
    return this;
  }

  async execute(options = {}) {
    const { verbose = false } = options;
    
    if (verbose) console.log('🔄 Executing connectors...');
    await this.executeConnectors();
    
    if (verbose) console.log('⚙️  Executing processors...');
    this.executeProcessors();
    
    if (verbose) console.log('👀 Executing monitors...');
    this.executeMonitors();
    
    return this.state;
  }

  async executeConnectors() {
    const tasks = [];
    
    Object.entries(this.services).forEach(([id, service]) => {
      if (service.type !== 'connector') return;
      
      const task = this.runConnector(id, service).catch(err => {
        this.state[`${id}_error`] = err.message;
      });
      
      tasks.push(task);
    });
    
    await Promise.allSettled(tasks);
  }

  async runConnector(id, service) {
    const { url, method = 'GET', headers = {}, outputKey, rules } = service.spec || {};
    if (!url) return;
    
    const response = await fetch(url, { method, headers });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    const key = outputKey || `${id}_data`;
    
    // Apply rules if present
    let final = data;
    if (rules) {
      const processed = this.applyRules(data, rules);
      const mode = rules.mode || 'merge';
      
      if (mode === 'replace') {
        final = processed;
      } else if (mode === 'dual') {
        this.state[`${key}_processed`] = processed;
      } else {
        final = { ...data, ...processed };
      }
    }
    
    this.state[key] = final;
  }

  executeProcessors() {
    Object.entries(this.services).forEach(([id, service]) => {
      if (service.type !== 'processor') return;
      
      const { inputKey, outputKey, transform } = service.spec || {};
      const inputData = this.state[inputKey];
      
      if (inputData === undefined) return;
      
      let result = inputData;
      if (transform) {
        result = this.applyRules(inputData, { rules: transform });
      }
      
      this.state[outputKey || `${id}_output`] = result;
    });
  }

  executeMonitors() {
    Object.entries(this.services).forEach(([id, service]) => {
      if (service.type !== 'monitor') return;
      
      const { checks = [], thresholds = {} } = service.spec || {};
      const results = {};
      
      checks.forEach(check => {
        const data = this.state[check.dataKey];
        if (data === undefined) return;
        
        const value = this.evaluateExpression(check.expression, data);
        const threshold = thresholds[check.name] || {};
        results[check.name] = {
          value,
          status: this.evaluateThreshold(value, threshold)
        };
      });
      
      this.state[`${id}_monitoring`] = results;
    });
  }

  // Core rule engine (shared logic from MicroService-OS)
  applyRules(data, ruleConfig) {
    let ctx = JSON.parse(JSON.stringify(data));
    const rules = ruleConfig.rules || [];
    
    for (const rule of rules) {
      if (this.evaluateCondition(rule.if, ctx)) {
        if (rule.then) {
          for (const [key, expr] of Object.entries(rule.then)) {
            ctx[key] = this.resolveTemplate(expr, ctx);
          }
        }
      }
    }
    
    return ctx;
  }

  evaluateCondition(condition, context) {
    if (!condition) return true;
    
    try {
      const ctx = { ...context, data: context };
      const func = new Function(...Object.keys(ctx), `return (${condition})`);
      return Boolean(func(...Object.values(ctx)));
    } catch {
      return false;
    }
  }

  resolveTemplate(template, context) {
    if (typeof template !== 'string') return template;
    
    const match = template.match(/^\{\{\s*(.*?)\s*\}\}$/);
    if (!match) return template;
    
    try {
      const ctx = { ...context, data: context };
      const func = new Function(...Object.keys(ctx), `return (${match[1]})`);
      return func(...Object.values(ctx));
    } catch {
      return template;
    }
  }

  evaluateExpression(expression, data) {
    try {
      const func = new Function('data', `return (${expression})`);
      return func(data);
    } catch {
      return null;
    }
  }

  evaluateThreshold(value, threshold) {
    if (typeof threshold.above === 'number' && value >= threshold.above) return 'critical';
    if (typeof threshold.below === 'number' && value <= threshold.below) return 'critical';
    if (typeof threshold.warnAbove === 'number' && value >= threshold.warnAbove) return 'warning';
    if (typeof threshold.warnBelow === 'number' && value <= threshold.warnBelow) return 'warning';
    if (typeof threshold.critical === 'number' && value >= threshold.critical) return 'critical';
    if (typeof threshold.warning === 'number' && value >= threshold.warning) return 'warning';
    return 'ok';
  }
}

module.exports = SPCEngine;
