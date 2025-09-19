#!/usr/bin/env node

const { program } = require('commander');
const pkg = require('../package.json');

// Commands
const runCommand = require('../src/commands/run');
const watchCommand = require('../src/commands/watch');
const replCommand = require('../src/commands/repl');
const exportCommand = require('../src/commands/export');

program
  .name('axis')
  .version(pkg.version)
  .description('AXIS - Tree-OS CLI Runtime for SPC files');

program
  .command('run <file>')
  .description('Run an SPC file once')
  .option('--pretty', 'Pretty-print JSON output')
  .option('--verbose', 'Show execution details')
  .action(runCommand);

program
  .command('watch <file>')
  .description('Watch and continuously run an SPC file')
  .option('--interval <ms>', 'Polling interval in milliseconds', '5000')
  .option('--pretty', 'Pretty-print JSON output')
  .action(watchCommand);

program
  .command('repl')
  .description('Start interactive REPL')
  .action(replCommand);

program
  .command('export <file>')
  .description('Export SPC state')
  .option('--state-only', 'Export only the state object')
  .option('--pretty', 'Pretty-print JSON output')
  .action(exportCommand);

program
  .command('hash <file>')
  .description('Calculate SHA256 hash of SPC file')
  .action(async (file) => {
    const crypto = require('crypto');
    const fs = require('fs');
    const content = fs.readFileSync(file, 'utf8');
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    console.log(hash);
  });

program
  .command('dry-run <file>')
  .description('Show what services would execute without running them')
  .action(async (file) => {
    const fs = require('fs');
    const spc = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log('Services that would execute:');
    Object.entries(spc.services || {}).forEach(([id, service]) => {
      console.log(`  ${id} (${service.type}): ${service.title || 'Untitled'}`);
    });
  });

program.parse(process.argv);
