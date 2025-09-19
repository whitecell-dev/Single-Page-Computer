const fs = require('fs');
const SPCEngine = require('../engine');

async function runCommand(file, options) {
  try {
    // Load SPC file
    const spcContent = fs.readFileSync(file, 'utf8');
    const spc = JSON.parse(spcContent);
    
    // Create engine and execute
    const engine = new SPCEngine();
    engine.load(spc);
    
    const state = await engine.execute({ verbose: options.verbose });
    
    // Output result
    const output = options.pretty 
      ? JSON.stringify(state, null, 2)
      : JSON.stringify(state);
    
    console.log(output);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = runCommand;
