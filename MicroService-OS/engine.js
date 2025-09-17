// ===============================
// MicroService OS Engine
// ===============================
class SPCEngine {
  constructor() {
    this.globalState = {};
    this.services = new Map();
    this.runningServices = new Set();
    this.eventBus = new EventTarget();
    this.commandHistory = [];
  }

  // State management
  updateGlobalState(key, value) {
    this.globalState[key] = value;
    this.eventBus.dispatchEvent(new CustomEvent('stateChange', { detail: { key, value } }));
    this.refreshStateViewer();
  }

  getGlobalState(key) {
    return key ? this.globalState[key] : { ...this.globalState };
  }

  clearGlobalState() {
    this.globalState = {};
    this.refreshStateViewer();
  }

  // Service lifecycle
  registerService(id, config) {
    this.services.set(id, { 
      ...config, 
      status: 'stopped',
      lastRun: null,
      outputs: {}
    });
    this.log(`Registered service: ${id}`, 'info');
  }

  startService(id) {
    const service = this.services.get(id);
    if (!service) return false;
    
    service.status = 'running';
    this.runningServices.add(id);
    this.log(`Started service: ${id}`, 'success');
    
    // Auto-run if it's a connector type
    if (service.type === 'connector' && service.spec.url) {
      this.runService(id);
    }
    
    return true;
  }

  stopService(id) {
    const service = this.services.get(id);
    if (!service) return false;
    
    service.status = 'stopped';
    this.runningServices.delete(id);
    this.log(`Stopped service: ${id}`, 'warn');
    return true;
  }

  async runService(id) {
    const service = this.services.get(id);
    if (!service || service.status !== 'running') return;

    try {
      service.lastRun = new Date().toISOString();
      
      switch (service.type) {
        case 'connector':
          await this.runConnector(service);
          break;
        case 'processor':
          await this.runProcessor(service);
          break;
        case 'monitor':
          await this.runMonitor(service);
          break;
        case 'interface':
          this.runInterface(service);
          break;
      }
      
    } catch (error) {
      service.status = 'error';
      this.log(`Service ${id} error: ${error.message}`, 'error');
    }
  }

  // Service type implementations
  async runConnector(service) {
    const { url, method = 'GET', headers = {} } = service.spec;
    const response = await fetch(url, { method, headers });
    const data = await response.json();
    
    // Store in global state
    const outputKey = service.spec.outputKey || service.id + '_data';
    this.updateGlobalState(outputKey, data);
    
    // Apply rules if defined
    if (service.spec.rules) {
      const processed = this.applyRules(data, service.spec.rules);
      this.updateGlobalState(outputKey + '_processed', processed);
    }
    
    this.log(`Connector ${service.id} fetched data`, 'success');
  }

  async runProcessor(service) {
    const { inputKey, outputKey, transform } = service.spec;
    const inputData = this.getGlobalState(inputKey);
    
    if (!inputData) {
      this.log(`Processor ${service.id}: No input data found for key ${inputKey}`, 'warn');
      return;
    }
    
    // Apply transformation
    let result = inputData;
    if (transform) {
      result = this.applyRules(inputData, { rules: transform });
    }
    
    this.updateGlobalState(outputKey, result);
    this.log(`Processor ${service.id} transformed data`, 'success');
  }

  async runMonitor(service) {
    const { checks, thresholds } = service.spec;
    const results = {};
    
    for (const check of checks || []) {
      const data = this.getGlobalState(check.dataKey);
      if (data) {
        const value = this.evaluateExpression(check.expression, data);
        results[check.name] = {
          value,
          status: this.evaluateThreshold(value, thresholds[check.name] || {})
        };
      }
    }
    
    this.updateGlobalState(service.id + '_monitoring', results);
    this.log(`Monitor ${service.id} updated`, 'info');
  }

  runInterface(service) {
    // Interface services are rendered in the preview pane
    this.log(`Interface ${service.id} ready`, 'info');
  }

  // Rule evaluation engine
  applyRules(data, ruleConfig) {
    let state = JSON.parse(JSON.stringify(data));
    const rules = ruleConfig.rules || [];
    
    for (const rule of rules) {
      if (this.evaluateCondition(rule.if, state)) {
        if (rule.then) {
          for (const [key, expression] of Object.entries(rule.then)) {
            state[key] = this.resolveTemplate(expression, state);
          }
        }
      }
    }
    
    return state;
  }

  evaluateCondition(condition, context) {
    if (!condition) return true;
    try {
      const func = new Function(...Object.keys(context), `return ${condition}`);
      return Boolean(func(...Object.values(context)));
    } catch (e) {
      this.log(`Condition evaluation error: ${e.message}`, 'error');
      return false;
    }
  }

  resolveTemplate(template, context) {
    if (typeof template !== 'string') return template;
    
    const match = template.match(/^\{\{\s*(.*?)\s*\}\}$/);
    if (!match) return template;
    
    try {
      const func = new Function(...Object.keys(context), `return (${match[1]})`);
      return func(...Object.values(context));
    } catch (e) {
      this.log(`Template evaluation error: ${e.message}`, 'error');
      return template;
    }
  }

  evaluateExpression(expression, data) {
    try {
      const func = new Function('data', `return ${expression}`);
      return func(data);
    } catch (e) {
      return null;
    }
  }

  evaluateThreshold(value, thresholds) {
    if (value >= (thresholds.critical || Infinity)) return 'critical';
    if (value >= (thresholds.warning || Infinity)) return 'warning';
    return 'ok';
  }

  // Terminal/CLI interface
  executeCommand(command) {
    this.commandHistory.push(command);
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        return this.showHelp();
      case 'ps':
        return this.listServices();
      case 'start':
        return this.startServiceCommand(args[0]);
      case 'stop':
        return this.stopServiceCommand(args[0]);
      case 'run':
        return this.runServiceCommand(args[0]);
      case 'state':
        return this.showState(args[0]);
      case 'logs':
        return this.showLogs(args[0]);
      case 'clear':
        return this.clearTerminal();
      case 'export':
        return this.exportSystem();
      case 'create':
        return this.createServiceCommand(args);
      default:
        return `Unknown command: ${cmd}. Type 'help' for available commands.`;
    }
  }

  showHelp() {
    return `Available commands:
• ps                  - List all services
• start <service>     - Start a service
• stop <service>      - Stop a service  
• run <service>       - Execute a service once
• state [key]         - Show global state
• logs <service>      - Show service logs
• create <type> <id>  - Create new service
• export             - Export system config
• clear              - Clear terminal
• help               - Show this help`;
  }

  listServices() {
    if (this.services.size === 0) return 'No services registered';
    
    let output = 'SERVICES:\n';
    for (const [id, service] of this.services) {
      const status = service.status.toUpperCase().padEnd(8);
      const type = service.type.padEnd(10);
      output += `${id.padEnd(15)} ${status} ${type} ${service.title || ''}\n`;
    }
    return output;
  }

  startServiceCommand(id) {
    if (!id) return 'Usage: start <service_id>';
    return this.startService(id) ? `Started ${id}` : `Service ${id} not found`;
  }

  stopServiceCommand(id) {
    if (!id) return 'Usage: stop <service_id>';
    return this.stopService(id) ? `Stopped ${id}` : `Service ${id} not found`;
  }

  async runServiceCommand(id) {
    if (!id) return 'Usage: run <service_id>';
    if (!this.services.has(id)) return `Service ${id} not found`;
    
    await this.runService(id);
    return `Executed ${id}`;
  }

  showState(key) {
    const state = this.getGlobalState(key);
    return JSON.stringify(state, null, 2);
  }

  showLogs(serviceId) {
    return `Logs for ${serviceId}: (Feature coming soon)`;
  }

  clearTerminal() {
    return null; // Special return value to clear terminal
  }

  exportSystem() {
    const config = {
      services: Array.from(this.services.entries()).map(([id, service]) => ({
        id,
        ...service
      })),
      globalState: this.globalState,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'microservice-system.json';
    a.click();
    URL.revokeObjectURL(url);
    
    return 'System exported to file';
  }

  createServiceCommand(args) {
    const [type, id] = args;
    if (!type || !id) return 'Usage: create <type> <id>';
    
    const template = this.getServiceTemplate(type);
    if (!template) return `Unknown service type: ${type}`;
    
    template.id = id;
    this.registerService(id, template);
    return `Created ${type} service: ${id}`;
  }

  // Logging
  log(message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, level };
    
    // Add to terminal output
    this.addTerminalLog(`[${timestamp}] ${message}`, level);
  }

  addTerminalLog(message, level = 'info') {
    const output = document.getElementById('terminalOutput');
    const div = document.createElement('div');
    div.className = `log-line log-${level}`;
    div.textContent = message;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
  }

  refreshStateViewer() {
    const viewer = document.getElementById('globalState');
    if (viewer) {
      viewer.textContent = JSON.stringify(this.globalState, null, 2);
    }
  }

  // Service templates
  getServiceTemplate(type) {
    const templates = {
      monitor: {
        type: 'monitor',
        title: 'New Monitor',
        spec: {
          checks: [
            { name: 'health', dataKey: 'api_data', expression: 'data.status === "ok"' }
          ],
          thresholds: {
            health: { warning: 0.8, critical: 0.5 }
          }
        }
      },
      processor: {
        type: 'processor',
        title: 'New Processor',
        spec: {
          inputKey: 'raw_data',
          outputKey: 'processed_data',
          transform: [
            { name: 'format', if: 'true', then: { formatted: '{{ data.value * 100 }}' } }
          ]
        }
      },
      interface: {
        type: 'interface',
        title: 'New Interface',
        spec: {
          inputs: [
            { name: 'value', label: 'Value', type: 'number', default: 0 }
          ],
          outputKey: 'interface_data'
        }
      },
      connector: {
        type: 'connector',
        title: 'New Connector',
        spec: {
          url: 'https://api.example.com/data',
          method: 'GET',
          outputKey: 'api_data',
          rules: {
            rules: [
              { name: 'process', if: 'true', then: { processed: '{{ data.length }}' } }
            ]
          }
        }
      }
    };
    
    return templates[type] ? JSON.parse(JSON.stringify(templates[type])) : null;
  }
}

// ===============================
// UI Management
// ===============================
const engine = new SPCEngine();
let currentServiceId = null;
const STORAGE_KEY = 'microservice_os_v1';

// DOM helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// Initialize system
function init() {
  loadSystem();
  bindEvents();
  renderServiceList();
  updateUI();
  
  // Load sample services
  if (engine.services.size === 0) {
    loadSampleServices();
  }
}

function loadSampleServices() {
  // Bitcoin price connector
  engine.registerService('btc-price', {
    type: 'connector',
    title: 'Bitcoin Price Feed',
    spec: {
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
      outputKey: 'btc_data',
      rules: {
        rules: [
          { name: 'extract_price', if: 'bitcoin', then: { 
            price: '{{ bitcoin.usd }}', 
            change: '{{ bitcoin.usd_24h_change }}' 
          }}
        ]
      }
    }
  });
  
  // Price monitor
  engine.registerService('price-monitor', {
    type: 'monitor',
    title: 'Price Alert Monitor',
    spec: {
      checks: [
        { name: 'price_check', dataKey: 'btc_data', expression: 'data.price > 50000' }
      ],
      thresholds: {
        price_check: { warning: 45000, critical: 40000 }
      }
    }
  });
  
  // Calculator interface
  engine.registerService('roi-calc', {
    type: 'interface',
    title: 'ROI Calculator',
    spec: {
      inputs: [
        { name: 'initial', label: 'Initial Investment', type: 'number', default: 1000 },
        { name: 'final', label: 'Final Value', type: 'number', default: 1200 },
        { name: 'years', label: 'Years Held', type: 'number', default: 1 }
      ],
      calculation: '((inputs.final - inputs.initial) / inputs.initial) * 100',
      outputKey: 'roi_result'
    }
  });
  
  renderServiceList();
}

function bindEvents() {
  // Service creation buttons
  $('#btnNewMonitor').onclick = () => createService('monitor');
  $('#btnNewProcessor').onclick = () => createService('processor');
  $('#btnNewInterface').onclick = () => createService('interface');
  $('#btnNewConnector').onclick = () => createService('connector');
  
  // System controls
  $('#btnSaveName').onclick = saveSystemName;
  $('#btnExport').onclick = () => engine.exportSystem();
  $('#fileIn').onchange = importSystem;
  
  // Service controls
  $('#btnStart').onclick = startCurrentService;
  $('#btnStop').onclick = stopCurrentService;
  $('#btnApply').onclick = applyServiceChanges;
  $('#btnDelete').onclick = deleteCurrentService;
  
  // State management
  $('#btnClearState').onclick = () => {
    engine.clearGlobalState();
    engine.log('Global state cleared', 'info');
  };
  $('#btnRefreshState').onclick = () => engine.refreshStateViewer();
  
  // Terminal
  const terminalInput = $('#terminalInput');
  terminalInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      const command = terminalInput.value.trim();
      if (command) {
        engine.addTerminalLog(`spc> ${command}`, 'muted');
        const result = engine.executeCommand(command);
        
        if (result === null) {
          // Clear terminal
          $('#terminalOutput').innerHTML = '';
          engine.addTerminalLog('MicroService OS v1.0 - AI-Native Computing Environment', 'success');
          engine.addTerminalLog('Type \'help\' for available commands', 'info');
        } else if (result) {
          engine.addTerminalLog(result, 'info');
        }
        
        terminalInput.value = '';
        updateUI(); // Refresh UI after commands
      }
    }
  };
}

function createService(type) {
  const template = engine.getServiceTemplate(type);
  if (!template) return;
  
  const id = `${type}-${Date.now().toString(36).slice(-4)}`;
  template.id = id;
  
  engine.registerService(id, template);
  currentServiceId = id;
  
  renderServiceList();
  updateUI();
  persistSystem();
}

function renderServiceList() {
  const container = $('#serviceList');
  container.innerHTML = '';
  
  for (const [id, service] of engine.services) {
    const item = document.createElement('div');
    item.className = `serviceitem ${id === currentServiceId ? 'active' : ''}`;
    
    const statusClass = service.status === 'running' ? 'running' : 
                       service.status === 'error' ? 'error' : 'stopped';
    
    item.innerHTML = `
      <div><strong>${service.title || id}</strong></div>
      <div class="small muted">${service.type}</div>
      <div class="service-status ${statusClass}"></div>
    `;
    
    item.onclick = () => {
      currentServiceId = id;
      renderServiceList();
      updateUI();
    };
    
    container.appendChild(item);
  }
}

function updateUI() {
  const service = engine.services.get(currentServiceId);
  
  // Update current service display
  $('#currentName').textContent = service ? (service.title || currentServiceId) : '(none)';
  
  // Update status indicator
  const statusEl = $('#currentStatus');
  if (service) {
    statusEl.className = `service-status ${service.status}`;
    statusEl.style.display = 'block';
  } else {
    statusEl.style.display = 'none';
  }
  
  // Update editor
  const editor = $('#editor');
  if (service) {
    editor.value = JSON.stringify(service, null, 2);
  } else {
    editor.value = '';
  }
  
  // Update preview
  renderServicePreview();
  
  // Update service list active state
  renderServiceList();
  
  // Refresh state viewer
  engine.refreshStateViewer();
}

function renderServicePreview() {
  const preview = $('#preview');
  const service = engine.services.get(currentServiceId);
  
  if (!service) {
    preview.innerHTML = '<div class="muted">No service selected</div>';
    return;
  }
  
  preview.innerHTML = '';
  
  // Service header
  const header = document.createElement('div');
  header.className = 'service-card';
  header.innerHTML = `
    <div class="bar">
      <strong>${service.title || service.id}</strong>
      <div class="spacer"></div>
      <span class="pill">${service.type}</span>
    </div>
    <div class="small muted">Status: ${service.status}</div>
    ${service.lastRun ? `<div class="small muted">Last run: ${new Date(service.lastRun).toLocaleTimeString()}</div>` : ''}
  `;
  preview.appendChild(header);
  
  // Type-specific preview
  switch (service.type) {
    case 'connector':
      renderConnectorPreview(preview, service);
      break;
    case 'processor':
      renderProcessorPreview(preview, service);
      break;
    case 'monitor':
      renderMonitorPreview(preview, service);
      break;
    case 'interface':
      renderInterfacePreview(preview, service);
      break;
  }
}

function renderConnectorPreview(container, service) {
  const card = document.createElement('div');
  card.className = 'service-card';
  
  const { url, outputKey } = service.spec;
  const data = engine.getGlobalState(outputKey);
  
  card.innerHTML = `
    <div><strong>Endpoint:</strong> ${url}</div>
    <div><strong>Output Key:</strong> ${outputKey}</div>
    ${data ? `<div class="metric-display">${JSON.stringify(data, null, 2)}</div>` : '<div class="muted">No data fetched yet</div>'}
  `;
  
  const runBtn = document.createElement('button');
  runBtn.className = 'btn';
  runBtn.textContent = 'Fetch Now';
  runBtn.onclick = () => {
    engine.runService(service.id);
    setTimeout(() => renderServicePreview(), 500);
  };
  
  card.appendChild(runBtn);
  container.appendChild(card);
}

function renderProcessorPreview(container, service) {
  const card = document.createElement('div');
  card.className = 'service-card';
  
  const { inputKey, outputKey } = service.spec;
  const inputData = engine.getGlobalState(inputKey);
  const outputData = engine.getGlobalState(outputKey);
  
  card.innerHTML = `
    <div><strong>Input Key:</strong> ${inputKey}</div>
    <div><strong>Output Key:</strong> ${outputKey}</div>
    ${inputData ? `<div class="metric-display">Input: ${JSON.stringify(inputData, null, 2)}</div>` : '<div class="muted">No input data</div>'}
    ${outputData ? `<div class="metric-display">Output: ${JSON.stringify(outputData, null, 2)}</div>` : '<div class="muted">No output data</div>'}
  `;
  
  container.appendChild(card);
}

function renderMonitorPreview(container, service) {
  const card = document.createElement('div');
  card.className = 'service-card';
  
  const monitorData = engine.getGlobalState(service.id + '_monitoring');
  
  if (monitorData) {
    card.innerHTML = '<div><strong>Monitoring Results:</strong></div>';
    for (const [check, result] of Object.entries(monitorData)) {
      const statusColor = result.status === 'ok' ? 'var(--ok)' : 
                         result.status === 'warning' ? 'var(--warn)' : 'var(--bad)';
      
      const checkDiv = document.createElement('div');
      checkDiv.className = 'metric-display';
      checkDiv.innerHTML = `
        <div>${check}: ${result.value}</div>
        <div style="color: ${statusColor}">Status: ${result.status}</div>
      `;
      card.appendChild(checkDiv);
    }
  } else {
    card.innerHTML = '<div class="muted">No monitoring data yet</div>';
  }
  
  container.appendChild(card);
}

function renderInterfacePreview(container, service) {
  const card = document.createElement('div');
  card.className = 'service-card';
  
  const { inputs, calculation } = service.spec;
  if (!inputs) {
    card.innerHTML = '<div class="muted">No inputs defined</div>';
    container.appendChild(card);
    return;
  }
  
  card.innerHTML = '<div><strong>Interactive Interface:</strong></div>';
  
  const form = document.createElement('div');
  form.className = 'grid2';
  
  const inputValues = {};
  
  inputs.forEach(input => {
    const field = document.createElement('div');
    field.className = 'field';
    field.innerHTML = `
      <label class="small muted">${input.label}</label>
      <input type="${input.type}" value="${input.default || ''}" data-name="${input.name}">
    `;
    
    const inputEl = field.querySelector('input');
    inputValues[input.name] = Number(input.default || 0);
    
    inputEl.oninput = () => {
      inputValues[input.name] = input.type === 'number' ? Number(inputEl.value) : inputEl.value;
      updateResult();
    };
    
    form.appendChild(field);
  });
  
  const resultDiv = document.createElement('div');
  resultDiv.className = 'metric-display';
  resultDiv.style.gridColumn = '1 / -1';
  
  function updateResult() {
    if (calculation) {
      try {
        const func = new Function('inputs', `return ${calculation}`);
        const result = func(inputValues);
        resultDiv.textContent = `Result: ${result}`;
        
        // Update global state
        engine.updateGlobalState(service.spec.outputKey || service.id + '_result', {
          inputs: inputValues,
          result
        });
      } catch (e) {
        resultDiv.textContent = `Error: ${e.message}`;
      }
    }
  }
  
  updateResult();
  
  card.appendChild(form);
  card.appendChild(resultDiv);
  container.appendChild(card);
}

function startCurrentService() {
  if (currentServiceId && engine.startService(currentServiceId)) {
    updateUI();
    persistSystem();
  }
}

function stopCurrentService() {
  if (currentServiceId && engine.stopService(currentServiceId)) {
    updateUI();
    persistSystem();
  }
}

function applyServiceChanges() {
  if (!currentServiceId) return;
  
  try {
    const config = JSON.parse($('#editor').value);
    engine.services.set(currentServiceId, config);
    engine.log(`Updated service: ${currentServiceId}`, 'success');
    updateUI();
    persistSystem();
  } catch (e) {
    engine.log(`JSON parse error: ${e.message}`, 'error');
  }
}

function deleteCurrentService() {
  if (!currentServiceId) return;
  
  if (confirm(`Delete service ${currentServiceId}?`)) {
    engine.services.delete(currentServiceId);
    engine.runningServices.delete(currentServiceId);
    engine.log(`Deleted service: ${currentServiceId}`, 'warn');
    
    currentServiceId = null;
    updateUI();
    persistSystem();
  }
}

function saveSystemName() {
  const name = $('#systemName').value.trim();
  if (name) {
    engine.updateGlobalState('system_name', name);
    engine.log(`System renamed to: ${name}`, 'info');
    persistSystem();
  }
}

function importSystem(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const config = JSON.parse(reader.result);
      
      // Clear current system
      engine.services.clear();
      engine.runningServices.clear();
      engine.globalState = config.globalState || {};
      
      // Load services
      if (config.services) {
        config.services.forEach(service => {
          engine.registerService(service.id, service);
        });
      }
      
      currentServiceId = null;
      updateUI();
      persistSystem();
      
      engine.log('System imported successfully', 'success');
      
    } catch (e) {
      engine.log(`Import failed: ${e.message}`, 'error');
    }
  };
  reader.readAsText(file);
}

function persistSystem() {
  try {
    const system = {
      services: Array.from(engine.services.entries()),
      globalState: engine.globalState,
      currentServiceId,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(system));
  } catch (e) {
    engine.log(`Persist failed: ${e.message}`, 'error');
  }
}

function loadSystem() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    
    const system = JSON.parse(saved);
    
    // Restore services
    if (system.services) {
      system.services.forEach(([id, service]) => {
        engine.services.set(id, service);
      });
    }
    
    // Restore state
    engine.globalState = system.globalState || {};
    currentServiceId = system.currentServiceId || null;
    
    engine.log('System loaded from storage', 'info');
    
  } catch (e) {
    engine.log(`Load failed: ${e.message}`, 'error');
  }
}

// Auto-save every 30 seconds
setInterval(persistSystem, 30000);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
