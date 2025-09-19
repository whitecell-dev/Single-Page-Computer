const fs = require('fs');
const chalk = require('chalk');
const SPCEngine = require('../engine');

async function watchCommand(file, options) {
  const interval = parseInt(options.interval) || 5000;
  
  console.log(chalk.cyan(`👀 Watching ${file} (interval: ${interval}ms)`));
  console.log(chalk.gray('Press Ctrl+C to stop\n'));
  
  let engine;
  
  async function tick() {
    try {
      const spcContent = fs.readFileSync(file, 'utf8');
      const spc = JSON.parse(spcContent);
      
      if (!engine) {
        engine = new SPCEngine();
      }
      
      engine.load(spc);
      const state = await engine.execute();
      
      const timestamp = new Date().toISOString();
      console.log(chalk.gray(`[${timestamp}]`));
      
      const output = options.pretty
        ? JSON.stringify(state, null, 2)
        : JSON.stringify(state);
      
      console.log(output);
      console.log(''); // blank line between updates
      
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  }
  
  // Initial run
  await tick();
  
  // Set up interval
  setInterval(tick, interval);
}

module.exports = watchCommand;
