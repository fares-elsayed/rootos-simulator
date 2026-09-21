// ═══════════════════════════════════════════════════════════════
//  RootOS — SystemCore v2.0
//  The brain of the OS: manages processes, memory, energy, devices
// ═══════════════════════════════════════════════════════════════

export const PROCESS_STATES = { RUNNING: "running", SLEEPING: "sleeping", STOPPED: "stopped" };
export const PRIORITIES = { HIGH: "high", NORMAL: "normal", LOW: "low" };

export class Process {
  constructor({ pid, name, priority = PRIORITIES.NORMAL, memory, energy, protected: isProtected = false }) {
    this.pid = pid; this.name = name; this.priority = priority;
    this.memory = memory; this.energy = energy; this.baseEnergy = energy; this.baseMemory = memory;
    this.state = PROCESS_STATES.RUNNING; this.protected = isProtected;
    this.cpuUsage = Math.floor(Math.random() * 15) + (priority === PRIORITIES.HIGH ? 10 : 3);
    this.uptime = 0;
  }
  tick() {
    this.uptime += 1;
    if (this.state === PROCESS_STATES.SLEEPING) { this.energy = Math.max(1, Math.floor(this.baseEnergy * 0.1)); this.cpuUsage = 0; return; }
    if (this.state === PROCESS_STATES.STOPPED) return;
    const energyDrift = (Math.random() - 0.5) * 2;
    this.energy = Math.max(1, Math.min(this.baseEnergy + 8, this.baseEnergy + Math.round(energyDrift)));
    this.cpuUsage = Math.max(0, Math.min(99, this.cpuUsage + Math.round((Math.random() - 0.5) * 6)));
    const memDrift = (Math.random() - 0.5) * 4;
    this.memory = Math.max(4, Math.round(this.baseMemory + memDrift));
  }
  sleep() { this.state = PROCESS_STATES.SLEEPING; }
  wake() { this.state = PROCESS_STATES.RUNNING; }
  stop() { this.state = PROCESS_STATES.STOPPED; }
  toJSON() { return { pid: this.pid, name: this.name, priority: this.priority, memory: this.memory, energy: this.energy, cpuUsage: this.cpuUsage, state: this.state, protected: this.protected, uptime: this.uptime }; }
}

export class SystemCore {
  constructor() {
    this._nextPid = 3; this._listeners = []; this._tickInterval = null; this._tickCount = 0;
    this.processes = [
      new Process({ pid: 1, name: "kernel", priority: PRIORITIES.HIGH, memory: 128, energy: 5, protected: true }),
      new Process({ pid: 2, name: "rootGuard", priority: PRIORITIES.HIGH, memory: 64, energy: 3, protected: true }),
    ];
    this.filesystem = {
      '/': {
        type: 'directory', children: {
          'home': { type: 'directory', children: { 'user': { type: 'directory', children: { 'readme.txt': { type: 'file', size: 2, content: 'Welcome to RootOS!' }, 'config.sys': { type: 'file', size: 8, content: 'System configuration' } } } } },
          'etc': { type: 'directory', children: { 'passwd': { type: 'file', size: 1, content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash' }, 'hosts': { type: 'file', size: 1, content: '127.0.0.1 localhost' } } },
          'var': { type: 'directory', children: { 'log': { type: 'directory', children: { 'boot.log': { type: 'file', size: 15, content: 'System boot log...' } } } } }
        }
      }
    };
    this.storage = { total: 1024 * 1024 * 1024, used: 0, ram: { total: 1024 * 1024 * 1024, used: 0 } };
    this.loadFilesystem();
    this.devices = [
      { name: "Display", energy: 15, sleep: false, type: "display" }, { name: "WiFi", energy: 8, sleep: false, type: "network" },
      { name: "Disk", energy: 10, sleep: false, type: "storage" }, { name: "Bluetooth", energy: 5, sleep: false, type: "wireless" },
    ];
    this.metrics = { totalMemory: 512, bootTime: Date.now(), tickCount: 0 };
    this.scheduler = { policy: "round-robin", quantum: 5, currentSlot: 0 };
  }

  subscribe(fn) { this._listeners.push(fn); return () => { this._listeners = this._listeners.filter(l => l !== fn); }; }
  _emit() { const snapshot = this.snapshot(); this._listeners.forEach(fn => fn(snapshot)); }
  start() { if (this._tickInterval) return; this._tickInterval = setInterval(() => this._tick(), 1000); }
  stop() { if (this._tickInterval) { clearInterval(this._tickInterval); this._tickInterval = null; } }
  _tick() {
    this._tickCount += 1; this.metrics.tickCount = this._tickCount;
    this.processes.forEach(p => p.tick());
    this._runScheduler(); this._emit();
  }
  _runScheduler() {
    const running = this.processes.filter(p => p.state === PROCESS_STATES.RUNNING && !p.protected);
    const totalE = this._calcTotalEnergy();
    if (totalE > 85) { const lowPrio = running.find(p => p.priority === PRIORITIES.LOW || p.priority === PRIORITIES.NORMAL); if (lowPrio) lowPrio.sleep(); }
    if (totalE < 60) { const sleeping = this.processes.find(p => p.state === PROCESS_STATES.SLEEPING && !p.protected); if (sleeping) sleeping.wake(); }
  }

  snapshot() {
    const processes = this.processes.map(p => p.toJSON());
    const procEnergy = this.processes.filter(p => p.state === PROCESS_STATES.RUNNING).reduce((s, p) => s + p.energy, 0);
    const devEnergy = this.devices.filter(d => !d.sleep).reduce((s, d) => s + d.energy, 0);
    const totalEnergy = Math.min(procEnergy + devEnergy, 100);
    const usedMemory = this.processes.reduce((s, p) => s + p.memory, 0);
    return {
      processes, files: this.getFlatFiles('/'), filesystem: this.filesystem, devices: [...this.devices],
      metrics: { ...this.metrics }, scheduler: { ...this.scheduler }, storage: { ...this.storage },
      energy: { total: totalEnergy, processes: procEnergy, devices: devEnergy, label: totalEnergy < 35 ? "Optimal" : totalEnergy < 65 ? "Moderate" : "Critical", level: totalEnergy < 35 ? "low" : totalEnergy < 65 ? "medium" : "high" },
      memory: { used: usedMemory, total: this.metrics.totalMemory, pct: Math.round((usedMemory / this.metrics.totalMemory) * 100) },
      uptime: Math.floor((Date.now() - this.metrics.bootTime) / 1000),
    };
  }

  getFlatFiles(path) {
    const dir = this.resolvePath(path);
    if (!dir || dir.type !== 'directory') return [];
    return Object.keys(dir.children).map(name => ({ name, size: dir.children[name].size || 0, type: dir.children[name].type === 'directory' ? 'folder' : this.getFileType(name) }));
  }
  getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const typeMap = { txt: 'text', log: 'log', sys: 'config', dat: 'data', js: 'code', py: 'code', json: 'data', html: 'web', css: 'style' };
    return typeMap[ext] || 'file';
  }

  spawnProcess(name, priority = PRIORITIES.NORMAL) {
    if (this.processes.some(p => p.name === name)) return { ok: false, error: `'${name}' is already running.` };
    const costs = { chrome: 25, game: 30, music: 10, editor: 15, browser: 22, python: 18, node: 20, vim: 5 };
    const energy = costs[name] || 12; const pid = this._nextPid++;
    const proc = new Process({ pid, name, priority, memory: energy * 4, energy });
    this.processes.push(proc); this._emit(); return { ok: true, pid, name, energy };
  }
  killProcess(name) {
    const proc = this.processes.find(p => p.name === name);
    if (!proc) return { ok: false, error: `'${name}': process not found.` };
    if (proc.protected) return { ok: false, error: `Cannot kill protected process '${name}'.` };
    this.processes = this.processes.filter(p => p.name !== name); this._emit(); return { ok: true, name, energy: proc.energy };
  }
  killByPid(pid) {
    const proc = this.processes.find(p => p.pid === pid);
    if (!proc) return { ok: false, error: `PID ${pid}: not found.` };
    if (proc.protected) return { ok: false, error: `Cannot kill protected process.` };
    return this.killProcess(proc.name);
  }
  sleepProcess(name) {
    const proc = this.processes.find(p => p.name === name);
    if (!proc) return { ok: false, error: `'${name}': not found.` };
    if (proc.state === PROCESS_STATES.SLEEPING) return { ok: false, error: `'${name}' is already sleeping.` };
    proc.sleep(); this._emit(); return { ok: true, name };
  }
  wakeProcess(name) {
    const proc = this.processes.find(p => p.name === name);
    if (!proc) return { ok: false, error: `'${name}': not found.` };
    if (proc.state === PROCESS_STATES.RUNNING) return { ok: false, error: `'${name}' is already running.` };
    proc.wake(); this._emit(); return { ok: true, name };
  }
  setPriority(name, priority) {
    const proc = this.processes.find(p => p.name === name);
    if (!proc) return { ok: false, error: `'${name}': not found.` };
    if (!Object.values(PRIORITIES).includes(priority)) return { ok: false, error: `Invalid priority '${priority}'.` };
    proc.priority = priority; this._emit(); return { ok: true, name, priority };
  }
  optimizePower() {
    const removed = this.processes.filter(p => p.priority !== PRIORITIES.HIGH && !p.protected);
    const saved = removed.reduce((s, p) => s + p.energy, 0);
    this.processes = this.processes.filter(p => p.priority === PRIORITIES.HIGH || p.protected);
    this._emit(); return { ok: true, count: removed.length, saved };
  }

  loadFilesystem() { const saved = localStorage.getItem('rootos_filesystem'); if (saved) { this.filesystem = JSON.parse(saved); } this.updateStorageUsage(); }
  saveFilesystem() { localStorage.setItem('rootos_filesystem', JSON.stringify(this.filesystem)); this.updateStorageUsage(); }
  updateStorageUsage() {
    let used = 0;
    const calcSize = (node) => { if (node.type === 'file') { used += node.size * 1024; } else if (node.children) { Object.values(node.children).forEach(calcSize); } };
    calcSize(this.filesystem['/']); this.storage.used = used;
  }
  resolvePath(path) {
    const parts = path.split('/').filter(p => p);
    let current = this.filesystem['/'];
    for (const part of parts) {
      if (part === '..') continue;
      if (!current.children || !current.children[part]) return null;
      current = current.children[part];
    }
    return current;
  }
  createFile(path, content = '') {
    const parts = path.split('/').filter(p => p); const filename = parts.pop();
    const dirPath = '/' + parts.join('/'); const dir = this.resolvePath(dirPath);
    if (!dir || dir.type !== 'directory') return { ok: false, error: `Directory '${dirPath}' not found.` };
    if (dir.children[filename]) return { ok: false, error: `'${filename}' already exists.` };
    const size = Math.max(1, Math.ceil(content.length / 1024));
    dir.children[filename] = { type: 'file', size, content };
    this.saveFilesystem(); return { ok: true, name: filename };
  }
  createDirectory(path) {
    const parts = path.split('/').filter(p => p); const dirname = parts.pop();
    const dirPath = '/' + parts.join('/'); const dir = this.resolvePath(dirPath);
    if (!dir || dir.type !== 'directory') return { ok: false, error: `Directory '${dirPath}' not found.` };
    if (dir.children[dirname]) return { ok: false, error: `'${dirname}' already exists.` };
    dir.children[dirname] = { type: 'directory', children: {} };
    this.saveFilesystem(); return { ok: true, name: dirname };
  }
  deleteFile(path) {
    const parts = path.split('/').filter(p => p); const filename = parts.pop();
    const dirPath = '/' + parts.join('/'); const dir = this.resolvePath(dirPath);
    if (!dir || dir.type !== 'directory' || !dir.children[filename]) return { ok: false, error: `'${path}' not found.` };
    delete dir.children[filename]; this.saveFilesystem(); return { ok: true, name: filename };
  }
  readFile(path) {
    const file = this.resolvePath(path);
    if (!file || file.type !== 'file') return { ok: false, error: `'${path}' not found or not a file.` };
    return { ok: true, content: file.content };
  }
  writeFile(path, content) {
    const file = this.resolvePath(path);
    if (!file || file.type !== 'file') return { ok: false, error: `'${path}' not found or not a file.` };
    file.content = content; file.size = Math.max(1, Math.ceil(content.length / 1024));
    this.saveFilesystem(); return { ok: true };
  }
  renameFile(oldPath, newPath) {
    const parts = oldPath.split('/').filter(p => p); const oldName = parts.pop();
    const oldDirPath = '/' + parts.join('/'); const oldDir = this.resolvePath(oldDirPath);
    if (!oldDir || !oldDir.children[oldName]) return { ok: false, error: `'${oldPath}' not found.` };
    const newParts = newPath.split('/').filter(p => p); const newName = newParts.pop();
    const newDirPath = '/' + newParts.join('/'); const newDir = this.resolvePath(newDirPath);
    if (!newDir || newDir.type !== 'directory') return { ok: false, error: `Directory '${newDirPath}' not found.` };
    if (newDir.children[newName]) return { ok: false, error: `'${newName}' already exists.` };
    newDir.children[newName] = oldDir.children[oldName]; delete oldDir.children[oldName];
    this.saveFilesystem(); return { ok: true };
  }
  listDirectory(path) {
    const dir = this.resolvePath(path);
    if (!dir || dir.type !== 'directory') return { ok: false, error: `'${path}' not found or not a directory.` };
    return { ok: true, items: Object.keys(dir.children).map(name => ({ name, type: dir.children[name].type, size: dir.children[name].size || 0 })) };
  }
  sleepDevice(name) {
    const dev = this.devices.find(d => d.name.toLowerCase() === name.toLowerCase());
    if (!dev) return { ok: false, error: `Device '${name}' not found.` };
    if (dev.sleep) return { ok: false, error: `${dev.name} is already sleeping.` };
    dev.sleep = true; this._emit(); return { ok: true, name: dev.name, saved: dev.energy };
  }
  wakeDevice(name) {
    const dev = this.devices.find(d => d.name.toLowerCase() === name.toLowerCase());
    if (!dev) return { ok: false, error: `Device '${name}' not found.` };
    if (!dev.sleep) return { ok: false, error: `${dev.name} is already awake.` };
    dev.sleep = false; this._emit(); return { ok: true, name: dev.name };
  }
  _calcTotalEnergy() {
    const pe = this.processes.filter(p => p.state === PROCESS_STATES.RUNNING).reduce((s, p) => s + p.energy, 0);
    const de = this.devices.filter(d => !d.sleep).reduce((s, d) => s + d.energy, 0);
    return Math.min(pe + de, 100);
  }
  formatUptime(seconds) {
    const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}

export const systemCore = new SystemCore();
