const wasmTarget = require('./targets/wasm');
const bytecodeTarget = require('./targets/bytecode');
const htmlTarget = require('./targets/html');
const Optimizer = require('./optimizer');

class Compiler {
  constructor(spc, options = {}) {
    this.spc = spc;
    this.options = options;
    this.target = options.target || 'bytecode';
    this.optimize = options.optimize || false;
  }

  async compile() {
    // Step 1: Validate SPC
    this.validate();
    
    // Step 2: Optimize if requested
    if (this.options.optimize) {
      this.spc = this.performOptimizations();
    }
    
    // Step 3: Compile to target
    switch (this.target) {
      case 'wasm':
        return wasmTarget.compile(this.spc);
      case 'bytecode':
        return bytecodeTarget.compile(this.spc);
      case 'html':
        return htmlTarget.compile(this.spc);
      default:
        throw new Error(`Unknown target: ${this.target}`);
    }
  }

  validate() {
    if (!this.spc.services) {
      throw new Error('SPC must have services');
    }
    
    // Check for circular dependencies
    const deps = this.buildDependencyGraph();
    if (this.hasCycles(deps)) {
      throw new Error('Circular dependencies detected');
    }
  }

  performOptimizations() {
    const optimizer = new Optimizer(this.spc);
    return optimizer.optimize();
  }

  buildDependencyGraph() {
    const graph = {};
    const services = this.spc.services || {};
    
    Object.entries(services).forEach(([id, service]) => {
      graph[id] = [];
      
      if (service.type === 'processor' && service.spec?.inputKey) {
        // Find which service produces this input
        Object.entries(services).forEach(([otherId, otherService]) => {
          if (otherService.spec?.outputKey === service.spec.inputKey) {
            graph[id].push(otherId);
          }
        });
      }
    });
    
    return graph;
  }

  hasCycles(graph) {
    const visited = new Set();
    const recursionStack = new Set();
    
    const hasCycleDFS = (node) => {
      visited.add(node);
      recursionStack.add(node);
      
      for (const neighbor of (graph[node] || [])) {
        if (!visited.has(neighbor)) {
          if (hasCycleDFS(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }
      
      recursionStack.delete(node);
      return false;
    };
    
    for (const node in graph) {
      if (!visited.has(node)) {
        if (hasCycleDFS(node)) return true;
      }
    }
    
    return false;
  }
}

module.exports = Compiler
