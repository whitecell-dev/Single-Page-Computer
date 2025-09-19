const fs = require('fs');
const SPCEngine = require('../engine');

async function exportCommand(file, options) {
  try {
    const spcContent = fs.readFileSync(file, 'utf8');
    const spc = JSON.parse(spcContent);
    
    if (options.stateOnly) {
      // Export just the state
      const engine = new SPCEngine();
      engine.load(spc);
      await engine.execute();
      
      const output = options.pretty
        ? JSON.stringify(engine.state, null, 2)
        : JSON.stringify(engine.state);
      
      console.log(output);
    } else {
      // Export full SPC
      const output = options.pretty
        ? JSON.stringify(spc, null, 2)
        : JSON.stringify(spc);
      
      console.log(output);
    }
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = exportCommand
