#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Compiler = require('../src/compiler');

program
  .name('kern')
  .version('0.1.0')
  .description('KERN - Simple SPC Compiler');

program
  .command('compile <input>')
  .description('Compile an SPC file')
  .option('-t, --target <type>', 'Target format (wasm|bytecode|html)', 'bytecode')
  .option('-o, --output <file>', 'Output file')
  .option('--optimize', 'Enable basic optimizations')
  .action(async (input, options) => {
    try {
      console.log(chalk.cyan(`⚙️  Compiling ${input} to ${options.target}...`));
      
      // Read SPC file
      const spcContent = fs.readFileSync(input, 'utf8');
      const spc = JSON.parse(spcContent);
      
      // Create compiler
      const compiler = new Compiler(spc, options);
      const output = await compiler.compile();
      
      // Write output
      const outputFile = options.output || `${path.basename(input, '.spc.json')}.${options.target}.js`;
      fs.writeFileSync(outputFile, output);
      
      console.log(chalk.green(`✅ Compiled to ${outputFile}`));
      console.log(chalk.gray(`   Original size: ${spcContent.length} bytes`));
      console.log(chalk.gray(`   Compiled size: ${output.length} bytes`));
      
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('optimize <input>')
  .description('Show optimization opportunities')
  .action((input) => {
    const spc = JSON.parse(fs.readFileSync(input, 'utf8'));
    const Optimizer = require('../src/optimizer');
    const optimizer = new Optimizer(spc);
    const report = optimizer.analyze();
    
    console.log(chalk.cyan('Optimization Opportunities:'));
    report.forEach(item => console.log(`  - ${item}`));
  });

program.parse(process.argv);
