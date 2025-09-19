// Compiles SPC to standalone HTML file with embedded deck-shell

exports.compile = function(spc) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${spc.meta?.name || 'Compiled SPC'}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui; background: #0b1020; color: #e5e7eb; padding: 20px; }
    .card { background: #111827; border-radius: 12px; padding: 16px; margin: 10px 0; }
    pre { background: #0a0e1a; padding: 10px; border-radius: 6px; overflow: auto; }
    .success { color: #34d399; }
    .error { color: #f87171; }
  </style>
</head>
<body>
  <h1>📦 ${spc.meta?.name || 'Compiled SPC Application'}</h1>
  <div id="status">Initializing...</div>
  <div id="output"></div>
  
  <script>
    // Embedded SPC configuration
    const SPC = ${JSON.stringify(spc, null, 2)};
    
    // Minimal runtime
    class SPCRuntime {
      constructor(config) {
        this.config = config;
        this.state = config.state || {};
      }
      
      async run() {
        const statusEl = document.getElementById('status');
        statusEl.textContent = 'Running...';
        statusEl.className = '';
        
        try {
          // Execute connectors
          for (const [id, service] of Object.entries(this.config.services || {})) {
            if (service.type === 'connector' && service.spec?.url) {
              statusEl.textContent = \`Fetching \${id}...\`;
              const response = await fetch(service.spec.url);
              const data = await response.json();
              this.state[service.spec.outputKey || id + '_data'] = data;
            }
          }
          
          // Execute processors
          for (const [id, service] of Object.entries(this.config.services || {})) {
            if (service.type === 'processor' && service.spec?.inputKey) {
              const input = this.state[service.spec.inputKey];
              if (input) {
                this.state[service.spec.outputKey || id + '_output'] = input;
              }
            }
          }
          
          statusEl.textContent = 'Complete!';
          statusEl.className = 'success';
          
          // Display results
          document.getElementById('output').innerHTML = 
            '<div class="card"><h2>State</h2><pre>' + 
            JSON.stringify(this.state, null, 2) + 
            '</pre></div>';
            
        } catch (error) {
          statusEl.textContent = 'Error: ' + error.message;
          statusEl.className = 'error';
        }
      }
    }
    
    // Auto-run on load
    const runtime = new SPCRuntime(SPC);
    runtime.run();
    
    // Refresh button
    document.addEventListener('DOMContentLoaded', () => {
      const button = document.createElement('button');
      button.textContent = 'Refresh';
      button.onclick = () => runtime.run();
      button.style.marginTop = '20px';
      document.body.appendChild(button);
    });
  </script>
</body>
</html>`;
};
