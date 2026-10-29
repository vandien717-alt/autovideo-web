const refs = {
  projectName: document.getElementById('projectName'),
  scriptText: document.getElementById('scriptText'),
  images: document.getElementById('images'),
  bg1: document.getElementById('bg1'),
  bg2: document.getElementById('bg2'),
  generateBtn: document.getElementById('generateBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  status: document.getElementById('status'),
  videoBox: document.getElementById('videoBox')
};

let generatedBlobUrl = '';

function setStatus(message, success = false, error = false) {
  refs.status.textContent = message;
  refs.status.style.color = error ? '#fca5a5' : success ? '#86efac' : '#cbd5e1';
}

function parseScenes(rawText) {
  const cleaned = rawText.replace(/\r/g, '').trim();
  if (!cleaned) return [];
  const blocks = cleaned.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length === 0) return [];
  return blocks;
}

function slugify(value) {
  const base = (value || 'autovideo').trim();
  return base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'autovideo';
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Không đọc được ảnh: ' + file.name));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Lỗi đọc ảnh: ' + file.name));
    reader.readAsDataURL(file);
  });
}

async function getImageSources() {
  const files = Array.from(refs.images.files || []);
  const images = [];
  for (const file of files) {
    const img = await loadImageFromFile(file);
    images.push(img);
  }
  return images;
}

function renderSceneOnCanvas(ctx, width, height, sceneText, bg1, bg2, image) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, bg1);
  gradient.addColorStop(1, bg2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (image) {
    const imgAspect = image.width / image.height;
    const canvasAspect = width / height;
    let drawW, drawH, drawX, drawY;

    if (imgAspect > canvasAspect) {
      drawH = height * 1.2;
      drawW = drawH * imgAspect;
      drawX = (width - drawW) / 2;
      drawY = -height * 0.1;
    } else {
      drawW = width * 1.1;
      drawH = drawW / imgAspect;
      drawX = (width - drawW) / 2;
      drawY = (height - drawH) / 2;
    }

    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  const textY = height * 0.72;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.font = '700 68px Inter, sans-serif';
  ctx.fillText(sceneText, width / 2 + 3, textY + 3);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 68px Inter, sans-serif';
  ctx.fillText(sceneText, width / 2, textY);
}

function createTextLines(text, maxWidth, fontSize) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';

  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = `700 ${fontSize}px Inter, sans-serif`;

  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (ctx.measureText(trial).width <= maxWidth || !current) {
      current = trial;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

async function renderVideoBlob() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = 1080;
  const height = 1920;
  const fps = 30;
  const frameDurationMs = 1000 / fps;
  canvas.width = width;
  canvas.height = height;

  const textScenes = parseScenes(refs.scriptText.value || '');
  const imageFiles = await getImageSources();
  const scenes = [];

  if (textScenes.length > 0) {
    for (let idx = 0; idx < textScenes.length; idx++) {
      const text = textScenes[idx].replace(/\s+/g, ' ');
      const useImage = imageFiles[idx % imageFiles.length] || null;
      scenes.push({ type: 'text', text, image: useImage, duration: Math.max(3, Math.ceil((text.length / 12) * 0.9)) });
    }
  }

  if (scenes.length === 0 && imageFiles.length > 0) {
    for (const image of imageFiles) {
      scenes.push({ type: 'image', text: '', image, duration: 3.5 });
    }
  }

  if (scenes.length === 0) {
    throw new Error('Vui lòng nhập kịch bản hoặc upload ít nhất một ảnh.');
  }

  const stream = canvas.captureStream(fps);
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks = [];

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) chunks.push(event.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    recorder.onerror = (event) => reject(new Error('Lỗi khi ghi video: ' + (event.error || 'unknown')));

    recorder.start();

    const bg1 = refs.bg1.value || '#1d3557';
    const bg2 = refs.bg2.value || '#0b1020';

    let currentFrame = 0;
    let sceneIdx = 0;
    let start = performance.now();

    function drawFrame(now) {
      const currentScene = scenes[sceneIdx];
      if (!currentScene) {
        recorder.stop();
        return;
      }

      const elapsedMs = now - start;
      const totalSceneMs = currentScene.duration * 1000;

      if (elapsedMs >= totalSceneMs) {
        sceneIdx += 1;
        if (!scenes[sceneIdx]) {
          recorder.stop();
          return;
        }
        start = now;
      }

      const activeScene = scenes[sceneIdx];
      const finalText = activeScene.type === 'text' ? activeScene.text : '';
      drawTextVideoFrame(ctx, width, height, finalText, bg1, bg2, activeScene.image || null, now,
        currentScene.duration, start, sceneIdx);
      currentFrame += 1;

      requestAnimationFrame(drawFrame);
    }

    requestAnimationFrame(drawFrame);
  });
}

function drawTextVideoFrame(ctx, width, height, text, bg1, bg2, image, now, duration, sceneStart, sceneIdx) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, bg1);
  gradient.addColorStop(1, bg2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (image) {
    const imgAspect = image.width / image.height;
    const canvasAspect = width / height;
    let drawW, drawH, drawX, drawY;

    if (imgAspect > canvasAspect) {
      drawH = height * 1.15;
      drawW = drawH * imgAspect;
      drawX = (width - drawW) / 2;
      drawY = (height - drawH) / 2;
    } else {
      drawW = width * 1.15;
      drawH = drawW / imgAspect;
      drawX = (width - drawW) / 2;
      drawY = (height - drawH) / 2;
    }

    ctx.save();
    ctx.globalAlpha = 0.78;
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  if (text) {
    const maxWidth = width - 120;
    const lines = createTextLines(text, maxWidth, 68);
    const startY = height * 0.76 - ((lines.length - 1) * 46);

    lines.forEach((line, index) => {
      const y = startY + index * 92;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '700 68px Inter, sans-serif';
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillText(line, width / 2 + 4, y + 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(line, width / 2, y);
      ctx.restore();
    });
  }
}

async function generateVideo() {
  refs.generateBtn.disabled = true;
  setStatus('Đang render video trong trình duyệt...', false, false);

  try {
    const blob = await renderVideoBlob();
    const url = URL.createObjectURL(blob);
    generatedBlobUrl = url;

    refs.videoBox.className = 'video-box video-ready';
    refs.videoBox.innerHTML = `
      <video controls playsinline autoplay>
        <source src="${url}" type="video/webm" />
        Trình duyệt của bạn không hỗ trợ video.
      </video>
    `;

    refs.downloadBtn.hidden = false;
    refs.downloadBtn.onclick = () => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slugify(refs.projectName.value || 'autovideo')}.webm`;
      a.click();
    };

    setStatus('Video đã được tạo thành công!', true, false);
  } catch (error) {
    refs.videoBox.className = 'video-box empty';
    refs.videoBox.textContent = 'Không tạo được video.';
    setStatus(error.message || 'Có lỗi khi render video.', false, true);
  } finally {
    refs.generateBtn.disabled = false;
  }
}

refs.generateBtn.addEventListener('click', generateVideo);
