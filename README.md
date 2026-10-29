const state = {
  jobs: []
};

const refs = {
  jobName: document.getElementById('jobName'),
  scriptText: document.getElementById('scriptText'),
  images: document.getElementById('images'),
  music: document.getElementById('music'),
  bg1: document.getElementById('bg1'),
  bg2: document.getElementById('bg2'),
  voice: document.getElementById('voice'),
  rate: document.getElementById('rate'),
  buildBtn: document.getElementById('buildBtn'),
  status: document.getElementById('status'),
  videoPreview: document.getElementById('videoPreview'),
  jobList: document.getElementById('jobList'),
  apiHealth: document.getElementById('apiHealth')
};

function setStatus(message, type = 'info') {
  refs.status.textContent = message;
  refs.status.style.color = type === 'error' ? '#fca5a5' : type === 'success' ? '#86efac' : '#cbd5e1';
}

async function checkHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    refs.apiHealth.textContent = data.ok ? 'API OK' : 'API ERROR';
    refs.apiHealth.style.color = data.ok ? '#86efac' : '#fca5a5';
  } catch (error) {
    refs.apiHealth.textContent = 'API OFFLINE';
    refs.apiHealth.style.color = '#fca5a5';
  }
}

async function loadJobs() {
  try {
    const res = await fetch('/api/jobs');
    const data = await res.json();
    state.jobs = data.jobs || [];
    renderJobs();

    if (state.jobs.length > 0) {
      const latest = state.jobs[0];
      renderPreview(latest.url);
    } else {
      refs.videoPreview.className = 'video-preview empty';
      refs.videoPreview.textContent = 'Chưa có video nào.';
    }
  } catch (error) {
    console.error(error);
  }
}

function renderJobs() {
  if (!state.jobs.length) {
    refs.jobList.innerHTML = '<div class="job-item"><div class="meta"><strong>Chưa có job nào</strong><small>Video mới xuất hiện ở đây sau khi render.</small></div></div>';
    return;
  }

  refs.jobList.innerHTML = state.jobs.map((job) => `
    <div class="job-item">
      <div class="meta">
        <strong>${job.name}</strong>
        <small>${new Date(job.updatedAt).toLocaleString('vi-VN')}</small>
      </div>
      <a href="${job.url}" target="_blank" rel="noreferrer">Mở video</a>
    </div>
  `).join('');
}

function renderPreview(url) {
  refs.videoPreview.className = 'video-preview video-ready';
  refs.videoPreview.innerHTML = `
    <video controls playsinline autoplay muted>
      <source src="${url}" type="video/mp4" />
      Trình duyệt của bạn không hỗ trợ video.
    </video>
  `;
}

refs.buildBtn.addEventListener('click', async () => {
  const text = refs.scriptText.value.trim();
  const images = refs.images.files;

  if (!text && images.length === 0) {
    setStatus('Vui lòng nhập kịch bản hoặc chọn ít nhất 1 ảnh.', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('name', refs.jobName.value.trim() || `job-${Date.now()}`);
  formData.append('text', text);
  formData.append('voice', refs.voice.value.trim() || 'vi-VN-HoaiMyNeural');
  formData.append('rate', refs.rate.value.trim() || '+0%');
  formData.append('bg1', refs.bg1.value || '#1d3557');
  formData.append('bg2', refs.bg2.value || '#0b1020');

  Array.from(images).forEach((file) => {
    formData.append('images', file);
  });

  if (refs.music.files[0]) {
    formData.append('music', refs.music.files[0]);
  }

  refs.buildBtn.disabled = true;
  setStatus('Đang tạo video, vui lòng chờ...', 'info');

  try {
    const res = await fetch('/api/build', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.details || data.message || 'Không thể tạo video.');
    }

    setStatus('Video đã được tạo thành công.', 'success');
    refs.images.value = '';
    refs.music.value = '';
    refs.scriptText.value = '';

    await loadJobs();
  } catch (error) {
    setStatus(error.message || 'Có lỗi xảy ra.', 'error');
  } finally {
    refs.buildBtn.disabled = false;
  }
});

checkHealth();
loadJobs();
setInterval(() => {
  checkHealth();
  loadJobs();
}, 15000);
