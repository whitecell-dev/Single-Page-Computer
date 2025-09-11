/**
 * AXIS Rules Engine (Minimal Kernel)
 * Single Page Computer Runtime
 * 
 * Pure decision logic with fixpoint iteration,
 * priority ordering, and template expressions.
 * 
 * @license MIT
 */

(function(global) {
  'use strict';

  class AxisRulesEngine {
    constructor() {
      this.auditTrail = [];
      this.conflictLog = [];
      this.currentIteration = 0;
    }

    apply(inputData, rulesConfig) {
      this.auditTrail = [];
      this.conflictLog = [];
      this.currentIteration = 0;

      let currentState = JSON.parse(JSON.stringify(inputData));
      let iteration = 0;
      let changed = true;
      const maxIterations = rulesConfig.max_iterations || 10;

      const sortedRules = [...(rulesConfig.rules || [])].sort(
        (a, b) => (a.priority || 999) - (b.priority || 999)
      );

      while (changed && iteration < maxIterations) {
        changed = false;
        iteration++;
        this.currentIteration = iteration;

        const iterationChanges = new Map();

        for (let rule of sortedRules) {
          const prevState = JSON.stringify(currentState);

          if (this.evaluateCondition(rule.if, currentState)) {
            this.log(`Applied: ${rule.name}`);

            if (rule.then) {
              const result = this.applyTransformationsWithTracking(
                currentState,
                rule.then,
                rule.name,
                iterationChanges
              );

              currentState = result.newState;
              if (prevState !== JSON.stringify(currentState)) {
                changed = true;
              }
            }
          }
        }
      }

      return {
        input: inputData,
        output: currentState,
        iterations: iteration,
        audit: this.auditTrail,
        conflicts: this.conflictLog,
        rulesApplied: this.getRulesApplied()
      };
    }

    applyTransformationsWithTracking(state, transformations, ruleName, iterationChanges) {
      const newState = JSON.parse(JSON.stringify(state));
      const fieldsChanged = [];

      for (const [path, value] of Object.entries(transformations)) {
        const resolvedValue = this.resolveValue(value, newState);

        if (iterationChanges.has(path)) {
          const previousRule = iterationChanges.get(path);
          this.conflictLog.push({
            field: path,
            previousRule,
            currentRule: ruleName,
            iteration: this.currentIteration
          });
        }

        iterationChanges.set(path, ruleName);
        this.setNestedPath(newState, path, resolvedValue);
        fieldsChanged.push(path);
      }

      return { newState, fieldsChanged };
    }

    evaluateCondition(condition, context) {
      if (!condition) return true;
      try {
        const safeContext = this.createSafeContext(context);
        const func = new Function(...Object.keys(safeContext), `return ${condition}`);
        return Boolean(func(...Object.values(safeContext)));
      } catch {
        return false;
      }
    }

    resolveValue(template, context) {
      if (typeof template !== 'string') return template;
      if (template.includes('{{') && template.includes('}}')) {
        const expression = template.replace(/\{\{(.*?)\}\}/g, '$1').trim();
        try {
          if (expression === 'now()') return new Date().toISOString();
          if (expression === 'uuid()')
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
              const r = (Math.random() * 16) | 0;
              const v = c === 'x' ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            });

          const safeContext = this.createSafeContext(context);
          const func = new Function(...Object.keys(safeContext), `return ${expression}`);
          return func(...Object.values(safeContext));
        } catch {
          return template;
        }
      }
      return template;
    }

    createSafeContext(context) {
      const flattened = this.flattenObject(context);
      return {
        ...flattened,
        ...context,
        Math,
        Date,
        parseInt,
        parseFloat,
        String,
        Number,
        Boolean,
        Array,
        JSON
      };
    }

    flattenObject(obj, prefix = '') {
      const flattened = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const newKey = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(flattened, this.flattenObject(obj[key], newKey));
          } else {
            flattened[newKey.replace(/\./g, '_')] = obj[key];
          }
        }
      }
      return flattened;
    }

    setNestedPath(obj, path, value) {
      const keys = path.split('.');
      let current = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    }

    log(message, level = 'info') {
      this.auditTrail.push({
        timestamp: new Date().toISOString(),
        level,
        message
      });
    }

    getRulesApplied() {
      return this.auditTrail
        .filter(e => e.message.startsWith('Applied:'))
        .map(e => e.message.replace('Applied: ', ''));
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AxisRulesEngine;
  } else {
    global.AxisRulesEngine = AxisRulesEngine;
  }
})(typeof window !== 'undefined' ? window : this);

