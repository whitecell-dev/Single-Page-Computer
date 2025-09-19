const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');
const SPCEngine = require('../engine');

function replCommand() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan('axis> ')
  });
  
  let engine = new SPCEngine();
  let currentFile = null;
  
  console.log(chalk.green('AXIS REPL v1.0'));
  console.log(chalk.gray('Type "help" for commands\n'));
  
  rl.prompt();
  
  rl.on('line', async (line) => {
    const input = line.trim();
    
    if (!input) {
      rl.prompt();
      return;
    }
    
    try {
      // Parse command
      const [cmd, ...args] = input.split(/\s+/);
      
      switch (cmd) {
        case 'help':
          console.log(`
Commands:
  load <file>         Load an SPC file
  services.list()     List all services
  state.get(<key>)    Get state value
  state.all()         Show entire state
  run <service>       Run a specific service
  execute             Execute all services
  clear              Clear state
  exit               Exit REPL
          `);
          break;
          
        case 'load':
          if (!args[0]) {
            console.log(chalk.red('Usage: load <file>'));
          } else {
            const spc = JSON.parse(fs.readFileSync(args[0], 'utf8'));
            engine.load(spc);
            currentFile = args[0];
            console.log(chalk.green(`Loaded: ${args[0]}`));
          }
          break;
          
        case 'services.list()':
          Object.entries(engine.services).forEach(([id, service]) => {
            console.log(`  ${id} (${service.type}): ${service.title || 'Untitled'}`);
          });
          break;
          
        case 'state.all()':
          console.log(JSON.stringify(engine.state, null, 2));
          break;
          
        case 'execute':
          await engine.execute({ verbose: true });
          console.log(chalk.green('All services executed'));
          break;
          
        case 'clear':
          engine.state = {};
          console.log(chalk.yellow('State cleared'));
          break;
          
        case 'exit':
          process.exit(0);
          break;
          
        default:
          // Handle state.get() and run commands
          if (input.startsWith('state.get(')) {
            const match = input.match(/state\.get\(['"](.+)['"]\)/);
            if (match) {
              const key = match[1];
              const value = engine.state[key];
              console.log(JSON.stringify(value, null, 2));
            }
          } else if (input.startsWith('run ')) {
            const serviceId = args[0];
            const service = engine.services[serviceId];
            if (!service) {
              console.log(chalk.red(`Service not found: ${serviceId}`));
            } else {
              if (service.type === 'connector') {
                await engine.runConnector(serviceId, service);
              } else if (service.type === 'processor') {
                engine.executeProcessors();
              } else if (service.type === 'monitor') {
                engine.executeMonitors();
              }
              console.log(chalk.green(`Executed: ${serviceId}`));
            }
          } else {
            console.log(chalk.red(`Unknown command: ${cmd}`));
          }
      }
      
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
    
    rl.prompt();
  });
  
  rl.on('close', () => {
    console.log('\nGoodbye!');
    process.exit(0);
  });
}

module.exports = replCommand
