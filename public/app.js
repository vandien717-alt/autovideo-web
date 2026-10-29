:root {
  --bg: #081120;
  --bg-soft: #101c33;
  --panel: rgba(15, 23, 42, 0.85);
  --panel-alt: rgba(15, 23, 42, 0.65);
  --card: #f8fafc;
  --text: #e5eefb;
  --muted: #a7b7d2;
  --line: rgba(148, 163, 184, 0.22);
  --primary: #60a5fa;
  --primary-strong: #2563eb;
  --success: #34d399;
  --warning: #fbbf24;
  --danger: #f87171;
  --shadow: 0 20px 50px rgba(15, 23, 42, 0.45);
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  min-height: 100%;
  font-family: 'Inter', sans-serif;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.20), transparent 25%),
    radial-gradient(circle at bottom right, rgba(96, 165, 250, 0.18), transparent 20%),
    linear-gradient(135deg, var(--bg) 0%, #0f172a 40%, #111827 100%);
  color: var(--text);
}

body {
  padding: 28px;
}

.page-shell {
  max-width: 1280px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--primary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 700;
}

.topbar h1 {
  margin: 0;
  font-size: clamp(32px, 4vw, 52px);
  line-height: 1.12;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(96, 165, 250, 0.35);
  background: rgba(96, 165, 250, 0.08);
  color: #dfeeff;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 24px;
}

.panel {
  border: 1px solid var(--line);
  background: rgba(15, 23, 42, 0.7);
  border-radius: 20px;
  box-shadow: var(--shadow);
  padding: 22px;
  backdrop-filter: blur(10px);
}

.form-panel h2,
.preview-panel h2,
.jobs-panel h3 {
  margin-top: 0;
  margin-bottom: 18px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.field-group.compact {
  margin-bottom: 0;
}

label {
  color: var(--text);
  font-weight: 600;
  font-size: 14px;
}

input,
textarea,
button {
  font: inherit;
}

input[type='text'],
input[type='file'],
input[type='color'],
textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.5);
  color: var(--text);
  padding: 12px 14px;
}

textarea {
  resize: vertical;
  min-height: 180px;
}

input[type='file'] {
  padding: 10px 12px;
}

input[type='color'] {
  min-height: 48px;
  padding: 6px;
}

.two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.primary-btn {
  width: 100%;
  margin-top: 8px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: white;
  font-weight: 700;
  cursor: pointer;
  padding: 14px 18px;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.primary-btn:hover {
  transform: translateY(-1px);
  opacity: 0.98;
}

.primary-btn:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

.status-box {
  min-height: 24px;
  margin-top: 14px;
  color: var(--muted);
  font-weight: 600;
}

.video-preview {
  min-height: 300px;
  border-radius: 16px;
  border: 1px dashed rgba(148, 163, 184, 0.4);
  background: rgba(148, 163, 184, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  color: var(--muted);
}

.video-preview.video-ready {
  padding: 12px;
  border-style: solid;
  border-color: rgba(52, 211, 153, 0.6);
  background: rgba(16, 185, 129, 0.06);
}

.video-preview video {
  width: 100%;
  max-width: 100%;
  border-radius: 12px;
  display: block;
}

.jobs-panel {
  margin-top: 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.small-gap {
  margin-bottom: 12px;
}

.job-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 360px;
  overflow-y: auto;
}

.job-item {
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.job-item .meta {
  min-width: 0;
}

.job-item strong {
  display: block;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.job-item small {
  color: var(--muted);
}

.job-item a {
  color: #dfeeff;
  text-decoration: none;
  font-weight: 600;
}

.job-item a:hover {
  text-decoration: underline;
}

@media (max-width: 980px) {
  body {
    padding: 18px;
  }

  .layout {
    grid-template-columns: 1fr;
  }
}
