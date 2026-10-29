const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const projectRoot = __dirname;
const dataRoot = path.join(projectRoot, 'autovideo_data');
const inboxDir = path.join(dataRoot, 'inbox');
const outboxDir = path.join(dataRoot, 'outbox');
const doneDir = path.join(dataRoot, 'done');
const failedDir = path.join(dataRoot, 'failed');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

ensureDir(dataRoot);
ensureDir(inboxDir);
ensureDir(outboxDir);
ensureDir(doneDir);
ensureDir(failedDir);

app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use(express.static(path.join(projectRoot, 'public')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(projectRoot, 'tmp_uploads'));
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
    const allowedMusic = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/m4a'];
    const isImage = allowedImages.includes(file.mimetype);
    const isMusic = allowedMusic.includes(file.mimetype);
    if (isImage || isMusic) {
      cb(null, true);
      return;
    }
    cb(new Error('File không được hỗ trợ. Chỉ chấp nhận ảnh JPG/PNG/WebP/BMP và nhạc MP3/WAV/M4A.'));
  }
});

function sanitizeName(value) {
  const base = String(value || '').trim();
  if (!base) {
    return `job-${Date.now()}`;
  }
  return base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `job-${Date.now()}`;
}

function getJobsList() {
  const entries = [];
  if (!fs.existsSync(outboxDir)) return entries;

  const mp4Files = fs.readdirSync(outboxDir)
    .filter((name) => name.toLowerCase().endsWith('.mp4'))
    .sort((a, b) => fs.statSync(path.join(outboxDir, b)).mtimeMs - fs.statSync(path.join(outboxDir, a)).mtimeMs);

  for (const file of mp4Files) {
    const fullPath = path.join(outboxDir, file);
    const stat = fs.statSync(fullPath);
    entries.push({
      name: path.basename(file, '.mp4'),
      fileName: file,
      size: stat.size,
      updatedAt: stat.mtime.toISOString(),
      url: `/videos/${encodeURIComponent(file)}`
    });
  }

  return entries;
}

function moveFileIfExists(sourcePath, targetDir) {
  if (!fs.existsSync(sourcePath)) return;
  ensureDir(targetDir);
  const targetPath = path.join(targetDir, path.basename(sourcePath));
  if (fs.existsSync(targetPath)) {
    const ext = path.extname(targetPath);
    const baseName = path.basename(targetPath, ext);
    let counter = 1;
    let candidate = path.join(targetDir, `${baseName}-${counter}${ext}`);
    while (fs.existsSync(candidate)) {
      counter += 1;
      candidate = path.join(targetDir, `${baseName}-${counter}${ext}`);
    }
    fs.renameSync(sourcePath, candidate);
    return;
  }
  fs.renameSync(sourcePath, targetPath);
}

function cleanupTmpUploads() {
  const tmpDir = path.join(projectRoot, 'tmp_uploads');
  if (!fs.existsSync(tmpDir)) return;
  for (const entry of fs.readdirSync(tmpDir)) {
    const fullPath = path.join(tmpDir, entry);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Autovideo API đang hoạt động.' });
});

app.get('/api/jobs', (req, res) => {
  res.json({ jobs: getJobsList() });
});

app.post('/api/build', upload.fields([
  { name: 'images', maxCount: 30 },
  { name: 'music', maxCount: 1 }
]), (req, res) => {
  try {
    const rawName = req.body.name || '';
    const jobName = sanitizeName(rawName || `job-${Date.now()}`);
    const scriptText = String(req.body.text || '').trim();
    const voice = String(req.body.voice || 'vi-VN-HoaiMyNeural');
    const rate = String(req.body.rate || '+0%');
    const bg1 = String(req.body.bg1 || '#1d3557');
    const bg2 = String(req.body.bg2 || '#0b1020');
    const images = req.files?.images || [];
    const musicFile = req.files?.music?.[0];

    if (!scriptText && images.length === 0) {
      cleanupTmpUploads();
      return res.status(400).json({
        ok: false,
        message: 'Vui lòng nhập kịch bản hoặc upload ít nhất một ảnh.'
      });
    }

    // cleanup previous job with same name if needed
    const jobInboxPath = path.join(inboxDir, jobName);
    if (fs.existsSync(jobInboxPath)) {
      fs.rmSync(jobInboxPath, { recursive: true, force: true });
    }
    ensureDir(jobInboxPath);

    if (scriptText) {
      const scriptOut = path.join(inboxDir, `${jobName}.txt`);
      fs.writeFileSync(scriptOut, scriptText, 'utf8');
    }

    if (images.length > 0) {
      images.forEach((file, index) => {
        const ext = path.extname(file.originalname) || '.jpg';
        const safeName = `${index + 1}${ext}`;
        fs.copyFileSync(file.path, path.join(jobInboxPath, safeName));
      });
    }

    let musicPath = null;
    if (musicFile) {
      const ext = path.extname(musicFile.originalname) || '.mp3';
      musicPath = path.join(inboxDir, `${jobName}-music${ext}`);
      fs.copyFileSync(musicFile.path, musicPath);
    }

    const pythonArgs = ['autovideo.py', '--dir', dataRoot];
    if (voice) pythonArgs.push('--voice', voice);
    if (rate) pythonArgs.push('--rate', rate);
    if (bg1) pythonArgs.push('--bg1', bg1);
    if (bg2) pythonArgs.push('--bg2', bg2);
    if (musicPath) pythonArgs.push('--music', musicPath);

    const proc = spawn('python3', pythonArgs, { cwd: projectRoot, stdio: ['ignore', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      cleanupTmpUploads();

      const outputPath = path.join(outboxDir, `${jobName}.mp4`);
      if (code !== 0 || !fs.existsSync(outputPath)) {
        return res.status(500).json({
          ok: false,
          message: 'Không thể tạo video.',
          details: stderr || stdout || 'Lỗi không xác định.',
          jobName
        });
      }

      res.json({
        ok: true,
        jobName,
        message: 'Video đã được tạo thành công.',
        url: `/videos/${encodeURIComponent(`${jobName}.mp4`)}`,
        outputFile: `${jobName}.mp4`
      });
    });
  } catch (error) {
    cleanupTmpUploads();
    res.status(500).json({
      ok: false,
      message: 'Lỗi khi xử lý job.',
      details: error.message
    });
  }
});

app.get('/videos/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const safeName = path.basename(fileName);
  const filePath = path.join(outboxDir, safeName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ ok: false, message: 'File video không tồn tại.' });
  }

  res.download(filePath, safeName);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(projectRoot, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Autovideo web app đang chạy tại http://localhost:${PORT}`);
});
