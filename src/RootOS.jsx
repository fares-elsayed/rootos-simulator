import { useState, useRef, useEffect } from "react";
import {
  Cpu, HardDrive, Zap, FolderOpen, Terminal, Wifi, Bluetooth,
  Monitor, X, Play, MemoryStick,
  Server, Clock, Shield, Info,
  Settings, CheckCircle2, Sun, Moon, Trash2
} from "lucide-react";
import { SystemCore, PRIORITIES, PROCESS_STATES } from "./SystemCore";

// ── Design Tokens ─────────────────────────────────────────────
const T = {
  bg: "#F8FAFC",
  bgPanel: "#FFFFFF",
  bgCard: "#F1F5F9",
  bgCardHover: "#E2E8F0",
  border: "#CBD5E1",
  borderHigh: "#94A3B8",
  accent: "#3B82F6",
  accentSoft: "rgba(59,130,246,0.1)",
  accentGlow: "rgba(59,130,246,0.05)",
  violet: "#8B5CF6",
  violet2: "rgba(139,92,246,0.1)",
  teal: "#06B6D4",
  rose: "#EF4444",
  amber: "#F59E0B",
  green: "#10B981",
  text: "#1E293B",
  textMid: "#475569",
  textDim: "#64748B",
  textFaint: "#94A3B8",
  winBg: "rgba(255,255,255,0.98)",
  winBorder: "rgba(59,130,246,0.2)",
  winBorderIn: "#E2E8F0",
};

// ── Boot screen lines ─────────────────────────────────────────
const BOOT_LINES = [
  { text: "Initializing RootOS kernel v2.0...", ok: true },
  { text: "Loading hardware abstraction layer...", ok: true },
  { text: "Process scheduler: online", ok: true },
  { text: "Memory allocator: online", ok: true },
  { text: "File system mounted: /root", ok: true },
  { text: "I/O controller: online", ok: true },
  { text: "Energy management unit: online", ok: true },
  { text: "GUI compositor: ready", ok: true },
];

const APPS = [
  { id: "processes", label: "Task Manager", Icon: Cpu },
  { id: "files", label: "File System", Icon: FolderOpen },
  { id: "terminal", label: "Terminal", Icon: Terminal },
  { id: "nano", label: "Nano Editor", Icon: Settings },
  { id: "devices", label: "Devices", Icon: Server },
  { id: "energy", label: "Energy", Icon: Zap },
  { id: "memory", label: "Memory", Icon: MemoryStick },
  { id: "storage", label: "Storage", Icon: HardDrive },
];

const WIN_SIZES = {
  processes: { w: 620, h: 420 },
  files: { w: 500, h: 400 },
  terminal: { w: 560, h: 400 },
  nano: { w: 600, h: 450 },
  devices: { w: 440, h: 360 },
  energy: { w: 420, h: 480 },
  memory: { w: 420, h: 400 },
  storage: { w: 420, h: 400 },
};

const START_POS = {
  processes: { x: 60, y: 50 },
  files: { x: 100, y: 70 },
  terminal: { x: 140, y: 60 },
  nano: { x: 160, y: 80 },
  devices: { x: 80, y: 90 },
  energy: { x: 120, y: 55 },
  memory: { x: 160, y: 75 },
  storage: { x: 180, y: 80 },
};

// ── Helpers ───────────────────────────────────────────────────
function Badge({ children, color = T.accent }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
      color, background: color + "20", border: `1px solid ${color}30`,
      borderRadius: 4, padding: "2px 7px", textTransform: "uppercase",
    }}>{children}</span>
  );
}

function MiniBar({ pct, color = T.accent, height = 4 }) {
  return (
    <div style={{ height, background: T.border, borderRadius: 99, overflow: "hidden" }}>
      <div style={{
        width: pct + "%", height: "100%", borderRadius: 99,
        background: color, transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

function statColor(pct) {
  if (pct < 40) return T.green;
  if (pct < 70) return T.amber;
  return T.rose;
}

// ── Boot Screen ───────────────────────────────────────────────
function BootScreen({ bootIdx, onDone }) {
  const pct = Math.round((bootIdx / BOOT_LINES.length) * 100);
  const complete = bootIdx >= BOOT_LINES.length;

  return (
    <div style={{
      width: "100%", height: "100vh", background: `linear-gradient(135deg, ${T.bg} 0%, ${T.accentSoft} 100%)`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'SF Pro Display', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", width: Math.random() * 4 + 2, height: Math.random() * 4 + 2,
            background: T.accent, borderRadius: "50%", left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%", opacity: 0.1,
            animation: `float ${Math.random() * 10 + 10}s linear infinite`,
          }} />
        ))}
      </div>
      <div style={{ marginBottom: 48, textAlign: "center", position: "relative" }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20, margin: "0 auto 20px",
          background: `linear-gradient(135deg, ${T.accent} 0%, ${T.violet} 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 8px 32px ${T.accent}30`, animation: "pulse 2s ease-in-out infinite",
        }}>
          <Server size={36} color="#fff" />
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: T.text, letterSpacing: "0.1em", animation: "fadeInUp 1s ease-out" }}>
          ROOT<span style={{ color: T.accent }}>OS</span>
        </div>
        <div style={{ fontSize: 12, color: T.textMid, letterSpacing: "0.2em", marginTop: 8, animation: "fadeInUp 1.2s ease-out" }}>
          SYSTEM v2.0 — KERNEL BOOT SEQUENCE
        </div>
      </div>
      <div style={{ width: 480, marginBottom: 32 }}>
        {BOOT_LINES.slice(0, bootIdx).map((line, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12, fontSize: 13, marginBottom: 8, paddingLeft: 12,
            opacity: i === bootIdx - 1 ? 1 : 0.6, transform: i === bootIdx - 1 ? "translateX(0)" : "translateX(-10px)",
            transition: "all 0.4s ease",
          }}>
            <CheckCircle2 size={14} color={T.green} style={{ flexShrink: 0 }} />
            <span style={{ color: i === bootIdx - 1 ? T.text : T.textMid }}>{line.text}</span>
          </div>
        ))}
      </div>
      <div style={{ width: 480 }}>
        <div style={{ height: 4, background: T.border, borderRadius: 99, overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)" }}>
          <div style={{
            height: "100%", borderRadius: 99, width: pct + "%", transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            background: `linear-gradient(90deg, ${T.accent}, ${T.violet})`, boxShadow: `0 0 20px ${T.accent}40`,
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 11, color: T.textMid, animation: "fadeIn 1.5s ease-out" }}>
          <span>{complete ? "System ready" : "Loading..."}</span><span>{pct}%</span>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float { from { transform: translateY(0px); } to { transform: translateY(-100vh); } }
      `}</style>
    </div>
  );
}

// ── Window Chrome ─────────────────────────────────────────────
function WindowFrame({ win, app, active, onClose, onMinimize, onMaximize, onFocus, children }) {
  const sz = WIN_SIZES[win.id] || { w: 500, h: 380 };
  const dragRef = useRef(null);
  const isMax = win.maximized;

  function onTitleDown(e) {
    if (e.button !== 0 || e.target.tagName === "BUTTON" || e.target.closest("button") || isMax) return;
    e.preventDefault();
    onFocus();
    const ox = e.clientX - win.x, oy = e.clientY - win.y;
    dragRef.current = { ox, oy };
    const move = ev => {
      if (!dragRef.current) return;
      window.dispatchEvent(new CustomEvent("rootos-drag", {
        detail: { id: win.id, x: ev.clientX - dragRef.current.ox, y: Math.max(0, ev.clientY - dragRef.current.oy) }
      }));
    };
    const up = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  // Dynamic style for Maximized vs Normal Window
  const windowStyle = isMax ? {
    position: "absolute", left: 0, top: 0,
    width: "100%", height: "calc(100vh - 48px)", // Leave space for Taskbar
    background: T.winBg,
    borderRadius: 0, overflow: "hidden",
    zIndex: active ? 100 : 10,
    display: "flex", flexDirection: "column",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    transition: "all 0.2s ease",
    backdropFilter: "blur(20px)",
  } : {
    position: "absolute", left: win.x, top: win.y,
    width: sz.w, height: sz.h,
    background: T.winBg,
    border: `1px solid ${active ? T.winBorder : T.winBorderIn}`,
    borderRadius: 14, overflow: "hidden",
    boxShadow: active
      ? `0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px ${T.accent}22, inset 0 1px 0 rgba(255,255,255,0.04)`
      : "0 8px 32px rgba(0,0,0,0.6)",
    zIndex: active ? 100 : 10,
    display: "flex", flexDirection: "column",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    transition: "box-shadow 0.2s ease, border-radius 0.2s ease",
    backdropFilter: "blur(20px)",
  };

  return (
    <div onMouseDown={onFocus} style={windowStyle}>
      {/* Title bar */}
      <div
        onMouseDown={onTitleDown}
        onDoubleClick={onMaximize}
        style={{
          height: 42, flexShrink: 0, cursor: isMax ? "default" : "grab",
          background: active
            ? `linear-gradient(90deg, rgba(99,102,241,0.08) 0%, transparent 100%)`
            : "transparent",
          borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center",
          padding: "0 14px", gap: 10,
          userSelect: "none",
        }}>

        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 7, marginRight: 4 }}>
          <button
            onClick={onClose}
            style={{
              width: 13, height: 13, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0,
              background: "#FF5F57", boxShadow: active ? "0 0 6px #FF5F5780" : "none", transition: "all 0.15s",
            }}
            title="Close"
          />
          <button
            onClick={onMinimize}
            style={{
              width: 13, height: 13, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0,
              background: "#FEBC2E", boxShadow: active ? "0 0 6px #FEBC2E80" : "none", transition: "all 0.15s",
            }}
            title="Minimize"
          />
          <button
            onClick={onMaximize}
            style={{
              width: 13, height: 13, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0,
              background: "#28C840", boxShadow: active ? "0 0 6px #28C84080" : "none", transition: "all 0.15s",
            }}
            title="Maximize"
          />
        </div>

        {/* App icon + title */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          gap: 7, pointerEvents: "none",
        }}>
          {app && <app.Icon size={13} color={active ? T.accent : T.textDim} />}
          <span style={{
            fontSize: 12, fontWeight: 500, letterSpacing: "0.06em",
            color: active ? T.textMid : T.textDim,
          }}>
            {app?.label?.toUpperCase() ?? win.id.toUpperCase()}
          </span>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", color: T.text }}>
        {children}
      </div>
    </div>
  );
}

// ── App UIs ───────────────────────────────────────────────────

function UIProcesses({ sys, core }) {
  const [name, setName] = useState("");
  const [priority, setPriority] = useState(PRIORITIES.NORMAL);
  const [selectedProcess, setSelectedProcess] = useState(null);

  const prioColor = p => p === PRIORITIES.HIGH ? "#F87171" : p === PRIORITIES.NORMAL ? "#60A5FA" : "#94A3B8";
  const stateColor = s => s === PROCESS_STATES.RUNNING ? "#34D399" : s === PROCESS_STATES.SLEEPING ? "#FBBF24" : "#F87171";

  function handleRun() {
    if (!name.trim()) return;
    core.spawnProcess(name.trim(), priority);
    setName("");
  }

  function showProcessDetails(process) { setSelectedProcess(process); }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "14px 16px", gap: 12, boxSizing: "border-box" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleRun()}
          placeholder="process name…"
          style={{
            flex: 1, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, padding: "7px 12px",
            fontSize: 12, outline: "none", fontFamily: "inherit",
          }}
        />
        <select
          value={priority} onChange={e => setPriority(e.target.value)}
          style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, padding: "7px 10px", fontSize: 11, outline: "none", cursor: "pointer" }}>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
        <button onClick={handleRun} style={{ background: T.accentSoft, border: `1px solid ${T.accent}40`, color: T.accent, borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
          <Play size={11} /> Run
        </button>
      </div>

      {selectedProcess && (
        <div style={{ background: T.bgCard, borderRadius: 8, padding: 12, border: `1px solid ${T.border}`, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3 style={{ margin: 0, color: T.text, fontSize: 14 }}>Process Details: {selectedProcess.name}</h3>
            <button onClick={() => setSelectedProcess(null)} style={{ background: "none", border: "none", color: T.textDim, cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
            <div><strong>PID:</strong> {selectedProcess.pid}</div>
            <div><strong>Priority:</strong> <span style={{ color: prioColor(selectedProcess.priority) }}>{selectedProcess.priority}</span></div>
            <div><strong>CPU Usage:</strong> {selectedProcess.cpuUsage}%</div>
            <div><strong>Memory:</strong> {selectedProcess.memory} MB</div>
            <div><strong>State:</strong> <Badge color={stateColor(selectedProcess.state)}>{selectedProcess.state}</Badge></div>
            <div><strong>Protected:</strong> {selectedProcess.protected ? "Yes" : "No"}</div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["PID", "Name", "Priority", "CPU", "Memory", "State", ""].map(h => (
                <th key={h} style={{ padding: "5px 8px", textAlign: "left", color: T.text, fontWeight: 500, letterSpacing: "0.08em", fontSize: 10, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sys.processes.map(p => (
              <tr key={p.pid} style={{ borderBottom: `1px solid ${T.border}22`, cursor: "pointer" }} onClick={() => showProcessDetails(p)}>
                <td style={{ padding: "7px 8px", color: T.text, fontSize: 10 }}>{p.pid}</td>
                <td style={{ padding: "7px 8px", color: T.text, fontWeight: 500 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {p.protected && <Shield size={9} color={T.amber} />}
                    {p.name}
                  </div>
                </td>
                <td style={{ padding: "7px 8px" }}><span style={{ color: prioColor(p.priority), fontSize: 10 }}>{p.priority}</span></td>
                <td style={{ padding: "7px 8px", minWidth: 60 }}><MiniBar pct={p.cpuUsage} color={statColor(p.cpuUsage)} height={3} /><span style={{ color: T.text, fontSize: 9 }}>{p.cpuUsage}%</span></td>
                <td style={{ padding: "7px 8px", color: T.text, fontSize: 10 }}>{p.memory} MB</td>
                <td style={{ padding: "7px 8px" }}><Badge color={stateColor(p.state)}>{p.state}</Badge></td>
                <td style={{ padding: "7px 8px" }}>
                  {!p.protected && (
                    <button onClick={(e) => { e.stopPropagation(); core.killByPid(p.pid); }} style={{ background: "none", border: "none", color: T.rose, cursor: "pointer", padding: 3 }} title="Kill">
                      <X size={12} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UIFiles({ sys, core }) {
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');

  const currentItems = core.getFlatFiles(currentPath) || [];

  const navigateTo = (path) => { setCurrentPath(path); setSelectedFile(null); setIsEditing(false); };

  const openFile = (filename) => {
    const fullPath = currentPath === '/' ? `/${filename}` : `${currentPath}/${filename}`;
    const result = core.readFile(fullPath);
    if (result.ok) { setSelectedFile(filename); setFileContent(result.content); setIsEditing(false); }
  };

  const saveFile = () => {
    const fullPath = currentPath === '/' ? `/${selectedFile}` : `${currentPath}/${selectedFile}`;
    const result = core.writeFile(fullPath, fileContent);
    if (result.ok) setIsEditing(false);
  };

  const renameFile = () => {
    if (!selectedFile || !newName.trim()) return;
    const oldPath = currentPath === '/' ? `/${selectedFile}` : `${currentPath}/${selectedFile}`;
    const newPath = currentPath === '/' ? `/${newName.trim()}` : `${currentPath}/${newName.trim()}`;
    const result = core.renameFile(oldPath, newPath);
    if (result.ok) { setSelectedFile(newName.trim()); setNewName(''); }
  };

  const deleteItem = (filename) => {
    const fullPath = currentPath === '/' ? `/${filename}` : `${currentPath}/${filename}`;
    core.deleteFile(fullPath);
    if (selectedFile === filename) { setSelectedFile(null); setIsEditing(false); }
  };

  const createNew = (type) => {
    const name = prompt(`Enter ${type} name:`);
    if (!name) return;
    const fullPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
    const result = type === 'file' ? core.createFile(fullPath, '') : core.createDirectory(fullPath);
    if (result.ok && type === 'file') openFile(name);
  };

  const fileIcon = (type) => {
    if (type === 'folder') return '📁';
    const icons = { text: '📄', log: '📋', config: '⚙️', data: '📊', code: '💻', web: '🌐', style: '🎨' };
    return icons[type] || '📄';
  };

  const pathParts = currentPath.split('/').filter(p => p);
  const breadcrumbs = pathParts.map((part, i) => ({ name: part, path: '/' + pathParts.slice(0, i + 1).join('/') }));

  return (
    <div style={{ display: "flex", height: "100%", gap: 12 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "12px 12px 0" }}>
          <button onClick={() => navigateTo('/')} style={{ background: T.accentSoft, border: `1px solid ${T.accent}40`, color: T.accent, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>🏠 Home</button>
          <button onClick={() => createNew('file')} style={{ background: T.green + '20', border: `1px solid ${T.green}40`, color: T.green, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>📄 New File</button>
          <button onClick={() => createNew('folder')} style={{ background: T.blue + '20', border: `1px solid ${T.blue}40`, color: T.blue, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>📁 New Folder</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "0 12px", padding: "8px 12px", background: T.bgCard, borderRadius: 8 }}>
          <span style={{ color: T.textMid, fontSize: 12 }}>📂</span>
          <button onClick={() => navigateTo('/')} style={{ color: T.accent, fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>root</button>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: T.textDim }}>/</span>
              <button onClick={() => navigateTo(crumb.path)} style={{ color: T.accent, fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>{crumb.name}</button>
            </span>
          ))}
        </div>
        <div style={{ flex: 1, overflow: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))", gap: 8, padding: "0 12px 12px" }}>
          {currentItems.map(item => (
            <div key={item.name} style={{ background: selectedFile === item.name ? T.accentSoft : T.bgCardHover, border: `1px solid ${selectedFile === item.name ? T.accent : T.border}`, borderRadius: 8, padding: "12px 8px", textAlign: "center", cursor: "pointer", transition: "all 0.15s" }}
              onClick={() => item.type === 'folder' ? navigateTo(currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`) : openFile(item.name)}
              onDoubleClick={() => item.type === 'folder' && navigateTo(currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`)}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{fileIcon(item.type)}</div>
              <div style={{ fontSize: 11, color: T.text, wordBreak: "break-all", lineHeight: 1.3 }}>{item.name}</div>
              <div style={{ fontSize: 9, color: T.textDim, marginTop: 4 }}>{item.type === 'folder' ? 'Folder' : `${item.size} KB`}</div>
              {selectedFile === item.name && (
                <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 6 }}>
                  <button onClick={(e) => { e.stopPropagation(); setNewName(item.name); }} style={{ background: T.amber + '20', border: 'none', color: T.amber, borderRadius: 4, padding: '2px 6px', fontSize: 9, cursor: 'pointer' }}>✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); deleteItem(item.name); }} style={{ background: T.rose + '20', border: 'none', color: T.rose, borderRadius: 4, padding: '2px 6px', fontSize: 9, cursor: 'pointer' }}>🗑️</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedFile && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, paddingRight: 12, paddingTop: 12, paddingBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: T.bgCard, borderRadius: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 16 }}>{fileIcon('file')}</span><span style={{ fontSize: 14, color: T.text }}>{selectedFile}</span></div>
            <div style={{ display: "flex", gap: 6 }}>
              {isEditing ? (
                <><button onClick={saveFile} style={{ background: T.green + '20', border: `1px solid ${T.green}40`, color: T.green, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>💾 Save</button><button onClick={() => setIsEditing(false)} style={{ background: T.border, border: `1px solid ${T.borderHigh}`, color: T.textMid, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>❌ Cancel</button></>
              ) : (
                <button onClick={() => setIsEditing(true)} style={{ background: T.accentSoft, border: `1px solid ${T.accent}40`, color: T.accent, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>✏️ Edit</button>
              )}
            </div>
          </div>
          {newName !== '' && (
            <div style={{ display: "flex", gap: 8, padding: "12px", background: T.bgCard, borderRadius: 8 }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} style={{ flex: 1, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, color: T.text, padding: "6px 12px", fontSize: 12 }} />
              <button onClick={renameFile} style={{ background: T.green + '20', border: `1px solid ${T.green}40`, color: T.green, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>✅ Rename</button>
              <button onClick={() => setNewName('')} style={{ background: T.border, border: `1px solid ${T.borderHigh}`, color: T.textMid, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>❌ Cancel</button>
            </div>
          )}
          <div style={{ flex: 1, background: T.bgCard, borderRadius: 8, overflow: "hidden" }}>
            {isEditing ? (
              <textarea value={fileContent} onChange={e => setFileContent(e.target.value)} style={{ width: "100%", height: "100%", background: T.bg, border: "none", color: T.text, padding: "12px", fontSize: 12, fontFamily: "monospace", resize: "none", outline: "none", boxSizing: "border-box" }} />
            ) : (
              <pre style={{ margin: 0, padding: "12px", color: T.text, fontSize: 12, fontFamily: "monospace", whiteSpace: "pre-wrap", wordWrap: "break-word", height: "100%", overflow: "auto" }}>{fileContent || "(empty file)"}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UINano({ core, fileName, closeWin }) {
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(true);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (fileName) {
      const result = core.readFile(fileName);
      if (result.ok) setContent(result.content);
      else setContent('');
    }
  }, [fileName, core]);

  const saveFile = () => {
    if (fileName) {
      let result = core.writeFile(fileName, content);
      if (!result.ok) {
        // If file doesn't exist, create it
        result = core.createFile(fileName, content);
      }
      if (result.ok) setSaved(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey) {
      switch (e.key) {
        case 's':
        case 'o':
          e.preventDefault();
          saveFile();
          break;
        case 'x':
          e.preventDefault();
          if (closeWin) closeWin();
          break;
      }
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg }}>
      <div style={{ padding: '8px 12px', background: T.bgCard, borderBottom: `1px solid ${T.border}`, fontSize: 12, color: T.textDim, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>GNU nano 6.2    {fileName || 'New File'}                                    {!saved ? 'Modified' : ''}</span>
        <div style={{ fontSize: 10 }}>^G Get Help  ^O Write Out  ^R Read File  ^Y Prev Page  ^K Cut Text  ^C Cur Pos</div>
      </div>
      <textarea
        ref={textareaRef} value={content}
        onChange={(e) => { setContent(e.target.value); setSaved(false); }}
        onKeyDown={handleKeyDown}
        style={{ flex: 1, background: T.bg, border: 'none', color: T.text, padding: '12px', fontSize: 12, fontFamily: 'monospace', resize: 'none', outline: 'none', lineHeight: 1.4 }}
        placeholder="Start typing..."
      />
      <div style={{ padding: '8px 12px', background: T.bgCard, borderTop: `1px solid ${T.border}`, fontSize: 10, color: T.textDim }}>
        ^X Exit      ^S/^O Save    ^W Where Is   ^V Next Page  ^U Uncut Text^T To Spell
      </div>
    </div>
  );
}

function UITerminal({ core, addTermLine, termLines, termIn, setTermIn, cmdHist, setCmdHist, cmdIdx, setCmdIdx, openWin }) {
  const termRef = useRef(null);
  const inputRef = useRef(null);
  const [currentDir, setCurrentDir] = useState('/home/user');

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [termLines]);

  function execCmd(raw) {
    const cmd = String(raw || "").trim();
    if (!cmd) return;
    setCmdHist(h => [cmd, ...h]);
    setCmdIdx(-1);
    const parts = cmd.split(/\s+/);
    const op = parts[0].toLowerCase();
    const args = parts.slice(1);
    const openWinFunc = openWin;

    const echo = { k: "in", t: `root@RootOS:${currentDir.replace('/home/user', '~')}# ${cmd}` };

    const commands = {
      help: () => addTermLine([echo, { k: "out", t: "Available commands:\n  ls [path]  cd [path]  pwd  mkdir <dir>  touch <file>  cat <file>\n  echo <txt> > <file>  rm <file|dir>  ps  kill <pid>\n  nano <file>  clear  date\nUse Up/Down arrows for command history." }]),
      ls: () => {
        const path = args[0] || currentDir;
        const result = core.listDirectory(path);
        if (!result.ok) return addTermLine([echo, { k: "err", t: result.error }]);
        const items = result.items.map(item => {
          const type = item.type === 'directory' ? 'd' : '-';
          const perms = item.type === 'directory' ? 'rwxr-xr-x' : 'rw-r--r--';
          const size = item.type === 'directory' ? '4096' : (item.size * 1024).toString();
          return `${type}${perms} 1 root root ${size.padStart(8)} ${new Date().toISOString().split('T')[0]} ${item.name}`;
        });
        addTermLine([echo, { k: "out", t: `total ${result.items.length * 4}\n${items.join('\n')}` }]);
      },
      cd: () => {
        const path = args[0] || '/home/user';
        if (path === '..') {
          const parts = currentDir.split('/').filter(p => p);
          parts.pop();
          const newDir = '/' + parts.join('/');
          setCurrentDir(newDir === '' ? '/' : newDir);
        } else {
          const resolved = core.resolvePath(path.startsWith('/') ? path : currentDir + '/' + path);
          if (!resolved || resolved.type !== 'directory') return addTermLine([echo, { k: "err", t: `cd: ${path}: No such file or directory` }]);
          setCurrentDir(path.startsWith('/') ? path : currentDir + '/' + path);
        }
        addTermLine([echo]);
      },
      pwd: () => addTermLine([echo, { k: "out", t: currentDir }]),
      mkdir: () => {
        if (!args[0]) return addTermLine([echo, { k: "err", t: "mkdir: missing operand" }]);
        const result = core.createDirectory(args[0].startsWith('/') ? args[0] : currentDir + '/' + args[0]);
        if (!result.ok) addTermLine([echo, { k: "err", t: result.error }]); else addTermLine([echo]);
      },
      touch: () => {
        if (!args[0]) return addTermLine([echo, { k: "err", t: "touch: missing file operand" }]);
        const result = core.createFile(args[0].startsWith('/') ? args[0] : currentDir + '/' + args[0], '');
        if (!result.ok) addTermLine([echo, { k: "err", t: result.error }]); else addTermLine([echo]);
      },
      cat: () => {
        if (!args[0]) return addTermLine([echo, { k: "err", t: "cat: missing file operand" }]);
        const result = core.readFile(args[0].startsWith('/') ? args[0] : currentDir + '/' + args[0]);
        if (!result.ok) addTermLine([echo, { k: "err", t: result.error }]); else addTermLine([echo, { k: "out", t: result.content }]);
      },
      echo: () => {
        const redirectIndex = args.indexOf('>');
        if (redirectIndex > 0) {
          const text = args.slice(0, redirectIndex).join(' ');
          const file = args[redirectIndex + 1];
          const result = core.writeFile(file.startsWith('/') ? file : currentDir + '/' + file, text);
          if (!result.ok) addTermLine([echo, { k: "err", t: result.error }]); else addTermLine([echo]);
        } else addTermLine([echo, { k: "out", t: args.join(' ') }]);
      },
      rm: () => {
        if (!args[0]) return addTermLine([echo, { k: "err", t: "rm: missing operand" }]);
        const result = core.deleteFile(args[0].startsWith('/') ? args[0] : currentDir + '/' + args[0]);
        if (!result.ok) addTermLine([echo, { k: "err", t: result.error }]); else addTermLine([echo]);
      },
      ps: () => {
        const snap = core.snapshot();
        const rows = snap.processes.map(p => `  ${String(p.pid).padEnd(5)} ${p.name.padEnd(16)} [${p.priority.padEnd(6)}] ${p.state.padEnd(10)} CPU:${String(p.cpuUsage).padStart(3)}% MEM:${p.memory}MB`).join("\n");
        addTermLine([echo, { k: "out", t: "  PID   COMMAND          PRIORITY STATE      CPU  MEM\n" + rows }]);
      },
      kill: () => {
        if (!args[0]) return addTermLine([echo, { k: "err", t: "kill: usage: kill <pid>" }]);
        const result = core.killByPid(parseInt(args[0]));
        if (!result.ok) addTermLine([echo, { k: "err", t: result.error }]); else addTermLine([echo]);
      },
      nano: () => {
        if (!args[0]) return addTermLine([echo, { k: "err", t: "nano: missing filename" }]);
        const path = args[0].startsWith('/') ? args[0] : currentDir + '/' + args[0];
        if (typeof openWinFunc === 'function') openWinFunc('nano', { fileName: path });
        addTermLine([echo]);
      },
      clear: () => addTermLine([{ k: "sys", t: "RootOS Terminal v2.0 — type 'help'" }], true),
      date: () => addTermLine([echo, { k: "out", t: new Date().toString() }]),
    };

    if (commands[op]) commands[op]();
    else addTermLine([echo, { k: "err", t: `${op}: command not found` }]);
  }

  function onKey(e) {
    if (e.key === "Enter") { execCmd(termIn); setTermIn(""); }
    else if (e.key === "ArrowUp") { const i = Math.min(cmdIdx + 1, cmdHist.length - 1); setCmdIdx(i); setTermIn(cmdHist[i] || ""); }
    else if (e.key === "ArrowDown") { const i = Math.max(cmdIdx - 1, -1); setCmdIdx(i); setTermIn(i === -1 ? "" : cmdHist[i]); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#080B10", fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>
      <div ref={termRef} onClick={() => inputRef.current?.focus()} style={{ flex: 1, padding: "12px 14px", overflowY: "auto", fontSize: 12, lineHeight: 1.8, cursor: "text" }}>
        {termLines.map((ln, i) => (
          <div key={i} style={{ color: ln.k === "in" ? "#60A5FA" : ln.k === "err" ? "#F87171" : ln.k === "sys" ? "#34D399" : "#E2E8F0", whiteSpace: "pre-wrap" }}>{ln.t}</div>
        ))}
        <div style={{ display: "flex", alignItems: "center", marginTop: 2 }}>
          <span style={{ color: T.violet, marginRight: 8, flexShrink: 0 }}>root@RootOS:~$</span>
          <input
            ref={inputRef} value={termIn} onChange={e => setTermIn(e.target.value)} onKeyDown={onKey} autoFocus
            style={{ background: "none", border: "none", outline: "none", color: "#E2E8F0", fontFamily: "inherit", fontSize: 12, flex: 1, caretColor: T.accent }}
          />
        </div>
      </div>
    </div>
  );
}

function UIDevices({ sys, core }) {
  const devIcon = type => {
    const map = { display: Monitor, network: Wifi, storage: HardDrive, wireless: Bluetooth };
    return map[type] || Server;
  };

  return (
    <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, overflow: "auto", height: "100%" }}>
      {sys.devices.map(d => {
        const Icon = devIcon(d.type);
        return (
          <div key={d.name} style={{ background: T.bgCard, border: `1px solid ${d.sleep ? T.border : T.borderHigh}`, borderRadius: 12, padding: 16, textAlign: "center", opacity: d.sleep ? 0.6 : 1, transition: "all 0.3s" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, margin: "0 auto 10px", background: d.sleep ? T.border : T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${d.sleep ? T.border : T.accent + "40"}` }}>
              <Icon size={20} color={d.sleep ? T.textDim : T.accent} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 4 }}>{d.name}</div>
            <div style={{ fontSize: 10, color: d.sleep ? T.textDim : T.teal, marginBottom: 12 }}>{d.sleep ? "Suspended" : `${d.energy}% load`}</div>
            {!d.sleep && <MiniBar pct={d.energy * 2.5} color={T.teal} />}
            <button
              onClick={() => d.sleep ? core.wakeDevice(d.name) : core.sleepDevice(d.name)}
              style={{ marginTop: 12, width: "100%", background: d.sleep ? T.accentSoft : T.bgCardHover, border: `1px solid ${d.sleep ? T.accent + "40" : T.border}`, color: d.sleep ? T.accent : T.textMid, borderRadius: 7, padding: "6px 0", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              {d.sleep ? <><Sun size={11} /> Wake</> : <><Moon size={11} /> Sleep</>}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function UIEnergy({ sys, core }) {
  const { energy, processes } = sys;
  const col = statColor(energy.total);

  return (
    <div style={{ padding: "16px 18px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: col, lineHeight: 1, letterSpacing: "-2px" }}>
          {energy.total}<span style={{ fontSize: 24, color: T.textDim }}>%</span>
        </div>
        <div style={{ fontSize: 10, color: T.textDim, letterSpacing: "0.2em", marginTop: 6 }}>ENERGY CONSUMPTION — {energy.label.toUpperCase()}</div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ height: 10, background: T.bgCard, borderRadius: 99, overflow: "hidden", border: `1px solid ${T.border}` }}>
          <div style={{ height: "100%", borderRadius: 99, width: energy.total + "%", transition: "width 0.6s", background: `linear-gradient(90deg, ${T.teal}, ${col})`, boxShadow: `0 0 12px ${col}50` }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {[["Processes", energy.processes, T.accent], ["Devices", energy.devices, T.violet]].map(([label, val, c]) => (
          <div key={label} style={{ flex: 1, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: c }}>{val}%</div>
            <div style={{ fontSize: 10, color: T.textDim, marginTop: 2, letterSpacing: "0.1em" }}>{label.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        {processes.map(p => (
          <div key={p.pid} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}><span style={{ color: T.textMid }}>{p.name}</span><span style={{ color: T.textDim }}>{p.energy}%</span></div>
            <MiniBar pct={p.energy * 2} color={statColor(p.energy * 2)} />
          </div>
        ))}
      </div>
      <button onClick={() => core.optimizePower()} style={{ width: "100%", background: T.accentSoft, border: `1px solid ${T.accent}40`, color: T.accent, borderRadius: 9, padding: "10px", cursor: "pointer", fontSize: 12, fontFamily: "inherit", letterSpacing: "0.08em", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
        <Zap size={13} /> OPTIMIZE POWER
      </button>
    </div>
  );
}

function UIMemory({ sys, core }) {
  const { memory, processes } = sys;
  const col = statColor(memory.pct);

  return (
    <div style={{ padding: "16px 18px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: T.textDim, letterSpacing: "0.1em" }}>RAM USAGE</span>
        <span style={{ fontSize: 12, color: T.text }}>{memory.used} / {memory.total} MB ({memory.pct}%)</span>
      </div>
      <div style={{ height: 10, background: T.bgCard, borderRadius: 99, overflow: "hidden", border: `1px solid ${T.border}`, marginBottom: 20 }}>
        <div style={{ width: memory.pct + "%", height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${T.accent}, ${col})`, transition: "width 0.6s", boxShadow: `0 0 10px ${col}50` }} />
      </div>
      {processes.map(p => {
        const pp = Math.round((p.memory / memory.total) * 100);
        return (
          <div key={p.pid} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}><span style={{ color: T.textMid }}>{p.name}</span><span style={{ color: T.textDim }}>{p.memory} MB ({pp}%)</span></div>
            <MiniBar pct={pp} color={statColor(pp)} />
          </div>
        );
      })}
      <button onClick={() => core.optimizePower()} style={{ width: "100%", marginTop: 14, background: T.bgCard, border: `1px solid ${T.border}`, color: T.textMid, borderRadius: 9, padding: "10px", cursor: "pointer", fontSize: 12, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
        <Trash2 size={13} /> Free Memory
      </button>
    </div>
  );
}

function UIStorage({ sys }) {
  const storageGB = (sys.storage.used / (1024 * 1024 * 1024)).toFixed(2);
  const totalGB = (sys.storage.total / (1024 * 1024 * 1024)).toFixed(0);
  const pct = Math.round((sys.storage.used / sys.storage.total) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "14px 16px", gap: 16, boxSizing: "border-box", overflow: "auto" }}>
      <div style={{ textAlign: "center" }}>
        <HardDrive size={48} color={T.accent} style={{ marginBottom: 12 }} />
        <div style={{ fontSize: 18, fontWeight: 600, color: T.text, marginBottom: 4 }}>Storage Overview</div>
        <div style={{ fontSize: 12, color: T.textMid }}>{storageGB} GB used of {totalGB} GB total</div>
      </div>
      <div style={{ background: T.bgCard, borderRadius: 12, padding: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 12, color: T.textMid }}>Disk Usage</span><span style={{ fontSize: 12, color: T.text }}>{pct}%</span></div>
          <MiniBar pct={pct} color={statColor(pct)} height={8} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ textAlign: "center", padding: 12, background: T.bgCardHover, borderRadius: 8 }}><div style={{ fontSize: 16, fontWeight: 600, color: T.accent }}>{storageGB} GB</div><div style={{ fontSize: 10, color: T.textDim }}>Used Space</div></div>
          <div style={{ textAlign: "center", padding: 12, background: T.bgCardHover, borderRadius: 8 }}><div style={{ fontSize: 16, fontWeight: 600, color: T.green }}>{(totalGB - storageGB).toFixed(2)} GB</div><div style={{ fontSize: 10, color: T.textDim }}>Free Space</div></div>
        </div>
      </div>
      <div style={{ background: T.bgCard, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 12 }}>Filesystem Structure</div>
        <div style={{ fontSize: 11, color: T.textMid, fontFamily: "monospace", lineHeight: 1.6 }}>
          <div>/ (root)</div><div>├── home/</div><div>│   └── user/</div><div>│       ├── readme.txt</div><div>│       ├── config.sys</div><div>│       └── [user files]</div><div>├── etc/</div><div>│   ├── passwd</div><div>│   └── hosts</div><div>└── var/</div><div>    └── log/</div><div>        └── boot.log</div>
        </div>
      </div>
    </div>
  );
}

const RENDERERS = { processes: UIProcesses, files: UIFiles, terminal: UITerminal, nano: UINano, devices: UIDevices, energy: UIEnergy, memory: UIMemory, storage: UIStorage };

// ── Main OS Component ─────────────────────────────────────────
export default function RootOS() {
  const coreRef = useRef(null);
  if (!coreRef.current) coreRef.current = new SystemCore();
  const core = coreRef.current;

  const [phase, setPhase] = useState("boot");
  const [bootIdx, setBootIdx] = useState(0);
  const [sys, setSys] = useState(() => core.snapshot());
  const [wins, setWins] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [clock, setClock] = useState(new Date());
  const [notif, setNotif] = useState(null);
  const [termLines, setTermLines] = useState([{ k: "sys", t: "RootOS Terminal v2.0 — type 'help'" }]);
  const [termIn, setTermIn] = useState("");
  const [cmdHist, setCmdHist] = useState([]);
  const [cmdIdx, setCmdIdx] = useState(-1);

  useEffect(() => { const unsub = core.subscribe(snap => setSys(snap)); return unsub; }, [core]);
  useEffect(() => { if (phase !== "desktop") return; core.start(); return () => core.stop(); }, [phase, core]);
  useEffect(() => {
    if (phase !== "boot") return;
    if (bootIdx >= BOOT_LINES.length) { const t = setTimeout(() => setPhase("desktop"), 600); return () => clearTimeout(t); }
    const t = setTimeout(() => setBootIdx(i => i + 1), 300); return () => clearTimeout(t);
  }, [phase, bootIdx]);
  useEffect(() => { const iv = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(iv); }, []);
  useEffect(() => {
    const handler = e => { const { id, x, y } = e.detail; setWins(ws => ws.map(w => w.id === id ? { ...w, x, y } : w)); };
    window.addEventListener("rootos-drag", handler); return () => window.removeEventListener("rootos-drag", handler);
  }, []);

  function notify(msg, type = "info") { setNotif({ msg, type }); setTimeout(() => setNotif(null), 3000); }

  function openWin(id, data = {}) {
    const existing = wins.find(w => w.id === id);
    if (existing) { setWins(ws => ws.map(w => w.id === id ? { ...w, minimized: false, maximized: false, data: { ...w.data, ...data } } : w)); setActiveId(id); return; }
    const pos = START_POS[id] || { x: 100, y: 80 };
    setWins(ws => [...ws, { id, x: pos.x, y: pos.y, minimized: false, maximized: false, data }]);
    setActiveId(id);
  }

  function closeWin(id) { setWins(ws => ws.filter(w => w.id !== id)); if (activeId === id) setActiveId(null); }
  function toggleMin(id) { setWins(ws => ws.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w)); }
  function toggleMax(id) { setWins(ws => ws.map(w => w.id === id ? { ...w, maximized: !w.maximized, x: w.maximized ? w.x : 0, y: w.maximized ? w.y : 0 } : w)); }

  function addTermLine(items, clearAll = false) {
    if (clearAll) { setTermLines([{ k: "sys", t: "RootOS Terminal v2.0 — type 'help'" }]); return; }
    setTermLines(ls => [...ls, ...items]);
  }

  if (phase === "boot") return <BootScreen bootIdx={bootIdx} />;

  const eCol = statColor(sys.energy.total);
  const desktopBg = `url('${process.env.PUBLIC_URL}/fares.png') center/cover no-repeat`;
  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", overflow: "hidden", background: desktopBg, fontFamily: "'JetBrains Mono','Fira Code',monospace", userSelect: "none" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: `linear-gradient(${T.borderHigh}0A 1px, transparent 1px), linear-gradient(90deg, ${T.borderHigh}0A 1px, transparent 1px)`, backgroundSize: "80px 80px" }} />

      <div style={{ position: "absolute", top: 24, right: 16, zIndex: 5, display: "flex", flexDirection: "column", gap: 6 }}>
        {APPS.map(app => (
          <div key={app.id} onDoubleClick={() => openWin(app.id)}
            style={{ width: 72, textAlign: "center", padding: "8px 4px 6px", borderRadius: 10, cursor: "pointer", transition: "all 0.15s", border: "1px solid transparent" }}
            onMouseEnter={e => { e.currentTarget.style.background = T.accentGlow; e.currentTarget.style.borderColor = T.winBorder; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, margin: "0 auto 6px", background: T.bgCard, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}><app.Icon size={16} color={T.accent} /></div>
            <div style={{ fontSize: 9, color: T.textMid, letterSpacing: "0.05em", lineHeight: 1.3 }}>{app.label}</div>
          </div>
        ))}
      </div>

      {wins.map(win => {
        if (win.minimized) return null;
        const app = APPS.find(a => a.id === win.id);
        const Renderer = RENDERERS[win.id];
        const active = activeId === win.id;
        return (
          <WindowFrame key={win.id} win={win} app={app} active={active} onClose={() => closeWin(win.id)} onMinimize={() => toggleMin(win.id)} onMaximize={() => toggleMax(win.id)} onFocus={() => setActiveId(win.id)}>
            {Renderer && (
              win.id === "terminal" ? <Renderer core={core} addTermLine={addTermLine} termLines={termLines} termIn={termIn} setTermIn={setTermIn} cmdHist={cmdHist} setCmdHist={setCmdHist} cmdIdx={cmdIdx} setCmdIdx={setCmdIdx} openWin={openWin} />
                : win.id === "nano" ? <Renderer core={core} fileName={win.data?.fileName} closeWin={() => closeWin(win.id)} />
                  : <Renderer sys={sys} core={core} />
            )}
          </WindowFrame>
        );
      })}
      {/* ── Floating Light Taskbar (Island Style) ── */}
      <div style={{
        position: "absolute", bottom: 20, left: 20, height: 56, zIndex: 200,
        background: "rgba(255, 255, 255, 0.85)", // Light theme background
        border: `1px solid rgba(255, 255, 255, 0.4)`,
        borderRadius: 28, // Pill shape
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.5)", // Professional contrast & depth
        backdropFilter: "blur(24px) saturate(150%)",
        display: "flex", alignItems: "center", padding: "0 16px", gap: 16,
        maxWidth: "calc(100vw - 40px)", overflowX: "auto", overflowY: "hidden",
        width: "fit-content", // Expands dynamically to the right
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Smooth expansion
      }}>
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
          paddingRight: 16, borderRight: `1px solid ${T.border}`,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: `linear-gradient(135deg, ${T.accent}, ${T.violet})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 12px ${T.accent}40`
          }}>
            <Server size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 13, color: T.text, letterSpacing: "0.15em", fontWeight: 700 }}>ROOTOS</span>
        </div>

        {/* Open windows (Expands to the right) */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0, transition: "all 0.3s" }}>
          {APPS.map(app => {
            const w = wins.find(w => w.id === app.id);
            if (!w) return null;
            const isActive = activeId === app.id && !w.minimized;
            return (
              <button key={app.id}
                onClick={() => {
                  if (w.minimized) { toggleMin(app.id); setActiveId(app.id); }
                  else if (isActive) toggleMin(app.id);
                  else setActiveId(app.id);
                }}
                style={{
                  background: isActive ? T.bgPanel : "transparent",
                  border: `1px solid ${isActive ? T.border : "transparent"}`,
                  color: isActive ? T.accent : T.textMid,
                  padding: "6px 14px", borderRadius: 18, cursor: "pointer",
                  fontSize: 11, fontFamily: "inherit", fontWeight: isActive ? 600 : 500,
                  letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                  transition: "all 0.2s ease",
                  boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                }}>
                <app.Icon size={14} />
                {app.label.toUpperCase()}
                {isActive && (
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.accent, marginLeft: 2 }} />
                )}
              </button>
            );
          })}
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 16, flexShrink: 0,
          paddingLeft: 16, borderLeft: `1px solid ${T.border}`,
        }}>
          {/* Energy bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Zap size={14} color={eCol} />
            <div style={{ width: 40, height: 6, background: T.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                width: sys.energy.total + "%", height: "100%", borderRadius: 99,
                background: eCol, transition: "width 0.5s",
              }} />
            </div>
            <span style={{ fontSize: 11, color: eCol, minWidth: 28, fontWeight: 600 }}>{sys.energy.total}%</span>
          </div>

          {/* Uptime */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Clock size={14} color={T.textDim} />
            <span style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>{core.formatUptime(sys.uptime)}</span>
          </div>

          {/* Clock */}
          <span style={{ fontSize: 12, color: T.text, minWidth: 76, textAlign: "right", fontWeight: 600 }}>
            {clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
      </div>

      {notif && (
        <div style={{ position: "absolute", bottom: 60, right: 16, zIndex: 300, background: T.bgPanel, border: `1px solid ${T.borderHigh}`, borderRadius: 10, padding: "10px 16px", color: T.text, fontSize: 12, boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${T.accent}20`, display: "flex", alignItems: "center", gap: 8, animation: "slideUp 0.2s ease" }}>
          <Info size={13} color={T.accent} />{notif.msg}
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.borderHigh}; border-radius: 99px; }
        select option { background: ${T.bgCard}; }
      `}</style>
    </div>
  );
}
