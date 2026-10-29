:root {
  --bg: #081120;
  --panel: rgba(15, 23, 42, 0.76);
  --card: #f8fafc;
  --text: #e2e8f0;
  --muted: #a7b7d2;
  --line: rgba(148, 163, 184, 0.22);
  --primary: #60a5fa;
  --primary-strong: #2563eb;
  --success: #34d399;
  --danger: #f87171;
  --shadow: 0 24px 56px rgba(15, 23, 42, 0.45);
}

* { box-sizing: border-box; }
html, body {
  margin: 0;
  min-height: 100%;
  font-family: 'Inter', sans-serif;
  background: radial-gradient(circle at top left, rgba(37,99,235,0.18), transparent 25%),
              radial-gradient(circle at bottom right, rgba(96,165,250,0.18), transparent 22%),
              linear-gradient(135deg, #081120 0%, #0f172a 45%, #111827 100%);
  color: var(--text);
}
body { padding: 28px; }

.app-shell { max-width: 1200px; margin: 0 auto; }
.topbar { margin-bottom: 24px; }
.eyebrow { margin: 0 0 8px; letter-spacing: 0.12em; text-transform: uppercase; font-size: 12px; color: var(--primary); font-weight: 700; }
.topbar h1 { margin: 0; font-size: clamp(34px, 5vw, 56px); }

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 24px;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  border-radius: 20px;
  padding: 22px;
  backdrop-filter: blur(10px);
}

.panel h2 { margin-top: 0; margin-bottom: 18px; }

.field-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
.field-group.compact { margin-bottom: 0; }
label { font-size: 14px; font-weight: 600; }
input, textarea, button { font: inherit; }
input[type='text'], input[type='file'], textarea, input[type='color'] {
  width: 100%;
  border: 1px solid rgba(148,163,184,0.25);
  background: rgba(15,23,42,0.48);
  color: var(--text);
  border-radius: 12px;
  padding: 12px 14px;
}
textarea { resize: vertical; min-height: 180px; }
input[type='color'] { min-height: 48px; padding: 6px; }
input[type='file'] { padding: 10px 12px; }

.two-col { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }

.primary-btn, .secondary-btn {
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  padding: 14px 18px;
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.primary-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: white;
  margin-top: 6px;
}
.secondary-btn {
  width: 100%;
  background: rgba(96,165,250,0.12);
  color: white;
  margin-top: 12px;
  border: 1px solid rgba(96,165,250,0.35);
}
.primary-btn:hover, .secondary-btn:hover { transform: translateY(-1px); opacity: 0.98; }
.primary-btn:disabled { cursor: not-allowed; opacity: 0.75; }

.status-box {
  margin-top: 12px;
  min-height: 24px;
  color: var(--muted);
  font-weight: 600;
}

.video-box {
  min-height: 420px;
  border-radius: 16px;
  border: 1px dashed rgba(148,163,184,0.4);
  background: rgba(148,163,184,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  color: var(--muted);
  text-align: center;
}

.video-box.video-ready {
  background: rgba(52,211,153,0.06);
  border-color: rgba(52,211,153,0.45);
  padding: 10px;
}

.video-box video {
  width: 100%;
  max-width: 100%;
  border-radius: 12px;
  display: block;
}

@media (max-width: 900px) {
  body { padding: 18px; }
  .layout { grid-template-columns: 1fr; }
  .two-col { grid-template-columns: 1fr; }
}
