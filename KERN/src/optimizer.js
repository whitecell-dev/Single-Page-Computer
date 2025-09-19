class Optimizer {
  constructor(spc) {
    this.spc = JSON.parse(JSON.stringify(spc)); // Deep clone
  }

  analyze() {
    const opportunities = [];
    
    // Check for constant conditions
    const services = this.spc.services || {};
    Object.entries(services).forEach(([id, service]) => {
      if (service.spec?.rules?.rules) {
        service.spec.rules.rules.forEach(rule => {
          if (rule.if === 'true' || rule.if === '1') {
            opportunities.push(`Service ${id}: Rule always true, can be inlined`);
          }
          if (rule.if === 'false' || rule.if === '0') {
            opportunities.push(`Service ${id}: Rule never executes, can be removed`);
          }
        });
      }
    });
    
    // Check for unused state keys
    const usedKeys = new Set();
    const definedKeys = new Set(Object.keys(this.spc.state || {}));
    
    Object.values(services).forEach(service => {
      if (service.spec?.inputKey) usedKeys.add(service.spec.inputKey);
      if (service.spec?.outputKey) definedKeys.add(service.spec.outputKey);
    });
    
    definedKeys.forEach(key => {
      if (!usedKeys.has(key)) {
        opportunities.push(`State key "${key}" is never read`);
      }
    });
    
    return opportunities;
  }

  optimize() {
    // Inline constant conditions
    const services = this.spc.services || {};
    
    Object.entries(services).forEach(([id, service]) => {
      if (service.spec?.rules?.rules) {
        service.spec.rules.rules = service.spec.rules.rules.filter(rule => {
          // Remove rules that never execute
          if (rule.if === 'false' || rule.if === '0') return false;
          
          // Inline rules that always execute
          if (rule.if === 'true' || rule.if === '1') {
            rule.if = true; // Simplify condition
          }
          
          return true;
        });
      }
    });
    
    // Pre-calculate execution order
    this.spc._executionOrder = this.calculateExecutionOrder();
    
    return this.spc;
  }

  calculateExecutionOrder() {
    const order = [];
    const visited = new Set();
    const services = this.spc.services || {};
    
    // Topological sort
    const visit = (id) => {
      if (visited.has(id)) return;
      visited.add(id);
      
      const service = services[id];
      if (service?.spec?.inputKey) {
        // Find dependencies
        Object.entries(services).forEach(([depId, depService]) => {
          if (depService.spec?.outputKey === service.spec.inputKey) {
            visit(depId);
          }
        });
      }
      
      order.push(id);
    };
    
    Object.keys(services).forEach(visit);
    return order;
  }
}

module.exports = Optimizer
