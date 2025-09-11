/**
 * AXIS Rules Engine v1.0.0
 * Single Page Computer (SPC) Decision Logic Engine
 * 
 * Pure decision logic with priority-based conflict resolution,
 * fixpoint iteration, and template expressions.
 * 
 * @license MIT
 * @author AXIS Project
 */

(function(global) {
    'use strict';

    /**
     * AXIS Rules Engine
     * Applies declarative rules to JSON data with deterministic execution
     */
    class AxisRulesEngine {
        constructor() {
            this.auditTrail = [];
            this.conflictLog = [];
            this.currentIteration = 0;
            this.version = '1.0.0';
        }

        /**
         * Apply rules to input data with priority-aware fixpoint iteration
         * @param {Object} inputData - Initial JSON state
         * @param {Object} rulesConfig - Rules configuration with max_iterations and rules array
         * @returns {Object} Result with input, output, iterations, audit trail, and conflicts
         */
        apply(inputData, rulesConfig) {
            // Initialize execution state
            this.auditTrail = [];
            this.conflictLog = [];
            this.currentIteration = 0;
            
            // Deep copy input to prevent mutation
            let currentState = JSON.parse(JSON.stringify(inputData));
            let iteration = 0;
            let changed = true;
            const maxIterations = rulesConfig.max_iterations || 10;

            this.log('Starting rule application');
            this.log(`Rules: ${rulesConfig.rules?.length || 0}`);

            // Sort rules by priority (lower number = higher priority)
            const sortedRules = [...(rulesConfig.rules || [])].sort((a, b) => 
                (a.priority || 999) - (b.priority || 999)
            );

            this.log(`Execution order: ${sortedRules.map(r => `${r.name}(${r.priority || 'default'})`).join(' → ')}`);

            // Fixpoint iteration - continue until no changes or max iterations
            while (changed && iteration < maxIterations) {
                changed = false;
                iteration++;
                this.currentIteration = iteration;
                this.log(`--- Iteration ${iteration} ---`);
                
                // Track field changes for conflict detection
                const iterationChanges = new Map();

                // Apply each rule in priority order
                for (let rule of sortedRules) {
                    const previousState = JSON.stringify(currentState);

                    // Evaluate rule condition
                    if (this.evaluateCondition(rule.if, currentState)) {
                        this.log(`Applied: ${rule.name}`);
                        
                        // Apply transformations if rule has 'then' clause
                        if (rule.then) {
                            const stateChanges = this.applyTransformationsWithTracking(
                                currentState, 
                                rule.then, 
                                rule.name,
                                iterationChanges
                            );
                            
                            currentState = stateChanges.newState;
                            
                            // Check if state actually changed
                            if (previousState !== JSON.stringify(currentState)) {
                                changed = true;
                            }
                        }
                    } else {
                        this.log(`Skipped: ${rule.name} (condition not met)`);
                    }
                }

                // Log conflicts if any occurred in this iteration
                if (this.conflictLog.length > 0) {
                    this.log(`Conflicts resolved: ${this.conflictLog.length}`, 'warning');
                }
            }

            // Check if we hit max iterations
            if (iteration >= maxIterations) {
                this.log(`Stopped at max iterations: ${maxIterations}`, 'warning');
            }

            this.log(`Completed in ${iteration} iterations`);

            return {
                input: inputData,
                output: currentState,
                iterations: iteration,
                audit: this.auditTrail,
                conflicts: this.conflictLog,
                rulesApplied: this.getRulesApplied(),
                engine_version: this.version
            };
        }

        /**
         * Apply transformations with conflict tracking
         * @param {Object} state - Current state
         * @param {Object} transformations - Field transformations to apply
         * @param {string} ruleName - Name of rule applying transformations
         * @param {Map} iterationChanges - Map tracking field changes in this iteration
         * @returns {Object} New state and list of fields changed
         */
        applyTransformationsWithTracking(state, transformations, ruleName, iterationChanges) {
            const newState = JSON.parse(JSON.stringify(state));
            const fieldsChanged = [];

            for (const [path, value] of Object.entries(transformations)) {
                const resolvedValue = this.resolveValue(value, newState);
                
                // Check for conflicts (multiple rules modifying same field)
                if (iterationChanges.has(path)) {
                    const previousRule = iterationChanges.get(path);
                    this.conflictLog.push({
                        field: path,
                        previousRule: previousRule,
                        currentRule: ruleName,
                        resolution: 'priority_override',
                        iteration: this.currentIteration
                    });
                    this.log(`Conflict: ${previousRule} vs ${ruleName} on ${path} → ${ruleName} wins`, 'warning');
                }
                
                // Track this change
                iterationChanges.set(path, ruleName);
                
                // Apply the change
                this.setNestedPath(newState, path, resolvedValue);
                fieldsChanged.push(path);
            }

            return { newState, fieldsChanged };
        }

        /**
         * Evaluate rule condition safely
         * @param {string} condition - JavaScript expression to evaluate
         * @param {Object} context - Data context for evaluation
         * @returns {boolean} Result of condition evaluation
         */
        evaluateCondition(condition, context) {
            if (!condition) return true;
            
            try {
                // Create safe evaluation context
                const safeContext = this.createSafeContext(context);
                
                // Use Function constructor for controlled evaluation
                const func = new Function(...Object.keys(safeContext), `return ${condition}`);
                const result = func(...Object.values(safeContext));
                
                return Boolean(result);
            } catch (e) {
                this.log(`Condition evaluation failed: ${condition} - ${e.message}`, 'error');
                return false;
            }
        }

        /**
         * Resolve template expressions like {{now()}} or {{user.age + 5}}
         * @param {*} template - Value that may contain template expressions
         * @param {Object} context - Data context for template resolution
         * @returns {*} Resolved value
         */
        resolveValue(template, context) {
            if (typeof template !== 'string') return template;

            // Check for template expressions {{...}}
            if (template.includes('{{') && template.includes('}}')) {
                const expression = template.replace(/\{\{(.*?)\}\}/g, '$1').trim();
                
                try {
                    // Built-in template functions
                    if (expression === 'now()') {
                        return new Date().toISOString();
                    }
                    if (expression === 'timestamp()') {
                        return Date.now();
                    }
                    if (expression === 'uuid()') {
                        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                            return v.toString(16);
                        });
                    }
                    
                    // Evaluate expression in safe context
                    const safeContext = this.createSafeContext(context);
                    const func = new Function(...Object.keys(safeContext), `return ${expression}`);
                    return func(...Object.values(safeContext));
                } catch (e) {
                    this.log(`Template resolution failed: ${template} - ${e.message}`, 'error');
                    return template;
                }
            }

            return template;
        }

        /**
         * Create safe evaluation context with flattened data and utilities
         * @param {Object} context - Original data context
         * @returns {Object} Safe context for expression evaluation
         */
        createSafeContext(context) {
            const flattened = this.flattenObject(context);
            return {
                ...flattened,      // Flattened paths like user_name, order_total
                ...context,        // Original nested structure
                Math: Math,        // Math functions
                Date: Date,        // Date constructor
                parseInt: parseInt,
                parseFloat: parseFloat,
                String: String,
                Number: Number,
                Boolean: Boolean,
                Array: Array,
                JSON: JSON
            };
        }

        /**
         * Flatten nested object for easier access in expressions
         * Converts {user: {name: "Alice"}} to {user_name: "Alice"}
         * @param {Object} obj - Object to flatten
         * @param {string} prefix - Current path prefix
         * @returns {Object} Flattened object
         */
        flattenObject(obj, prefix = '') {
            const flattened = {};
            
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const newKey = prefix ? `${prefix}.${key}` : key;
                    
                    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                        // Recursively flatten nested objects
                        Object.assign(flattened, this.flattenObject(obj[key], newKey));
                    } else {
                        // Create underscore version for easier access
                        flattened[newKey.replace(/\./g, '_')] = obj[key];
                    }
                }
            }
            
            return flattened;
        }

        /**
         * Set value at nested path like "user.status"
         * @param {Object} obj - Target object
         * @param {string} path - Dot-separated path
         * @param {*} value - Value to set
         */
        setNestedPath(obj, path, value) {
            const keys = path.split('.');
            let current = obj;

            // Navigate to parent of target
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }

            // Set the final value
            current[keys[keys.length - 1]] = value;
        }

        /**
         * Validate rules configuration
         * @param {Object} rulesConfig - Rules configuration to validate
         * @returns {string[]} Array of validation error messages
         */
        validate(rulesConfig) {
            const errors = [];

            if (!rulesConfig.rules || !Array.isArray(rulesConfig.rules)) {
                errors.push('Rules configuration must have a "rules" array');
                return errors;
            }

            const ruleNames = new Set();
            
            rulesConfig.rules.forEach((rule, index) => {
                // Check required fields
                if (!rule.name) {
                    errors.push(`Rule ${index}: Missing name`);
                } else if (ruleNames.has(rule.name)) {
                    errors.push(`Rule ${index}: Duplicate rule name "${rule.name}"`);
                } else {
                    ruleNames.add(rule.name);
                }

                // Validate priority
                if (rule.priority !== undefined && 
                    (typeof rule.priority !== 'number' || rule.priority < 0)) {
                    errors.push(`Rule ${index} (${rule.name}): Priority must be a non-negative number`);
                }

                // Validate condition syntax
                if (rule.if) {
                    try {
                        new Function('return ' + rule.if);
                    } catch (e) {
                        errors.push(`Rule ${index} (${rule.name}): Invalid condition syntax - ${e.message}`);
                    }
                }

                // Check for action clauses
                if (!rule.then && !rule.else) {
                    errors.push(`Rule ${index} (${rule.name}): Must have 'then' or 'else' clause`);
                }
            });

            return errors;
        }

        /**
         * Add entry to audit trail
         * @param {string} message - Log message
         * @param {string} level - Log level (info, warning, error)
         */
        log(message, level = 'info') {
            this.auditTrail.push({
                timestamp: new Date().toISOString(),
                level,
                message
            });
        }

        /**
         * Get list of rules that were applied during execution
         * @returns {string[]} Array of rule names that were applied
         */
        getRulesApplied() {
            return this.auditTrail
                .filter(entry => entry.message.startsWith('Applied:'))
                .map(entry => entry.message.replace('Applied: ', ''));
        }

        /**
         * Generate configuration hash for auditing
         * @param {Object} rulesConfig - Rules configuration
         * @returns {string} Hash of the configuration
         */
        generateRulesHash(rulesConfig) {
            const canonical = JSON.stringify(rulesConfig, Object.keys(rulesConfig).sort());
            return this.simpleHash(canonical);
        }

        /**
         * Simple hash function for configuration fingerprinting
         * @param {string} str - String to hash
         * @returns {string} Hex hash
         */
        simpleHash(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return Math.abs(hash).toString(16);
        }
    }

    // Export for different environments
    if (typeof module !== 'undefined' && module.exports) {
        // Node.js
        module.exports = AxisRulesEngine;
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(function() { return AxisRulesEngine; });
    } else {
        // Browser global
        global.AxisRulesEngine = AxisRulesEngine;
    }

})(typeof window !== 'undefined' ? window : this);
