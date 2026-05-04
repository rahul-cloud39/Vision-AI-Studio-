const form = document.getElementById('analyzeForm');
const imageInput = document.getElementById('imageInput');
const previewWrap = document.getElementById('previewWrap');
const previewGrid = document.getElementById('previewGrid');
const result = document.getElementById('result');
const statusText = document.getElementById('status');
const submitBtn = document.getElementById('submitBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const featureCards = document.querySelectorAll('.feature');

featureCards.forEach((card) => {
  card.addEventListener('click', () => {
    featureCards.forEach((item) => item.classList.remove('active'));
    card.classList.add('active');
  });
});

imageInput.addEventListener('change', () => {
  const files = [...imageInput.files].slice(0, 5);
  previewGrid.innerHTML = '';

  if (!files.length) return;

  files.forEach((file) => {
    const item = document.createElement('div');
    const img = document.createElement('img');
    const label = document.createElement('span');

    img.src = URL.createObjectURL(file);
    label.textContent = file.name;
    item.append(img, label);
    previewGrid.appendChild(item);
  });

  previewWrap.classList.add('active');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  submitBtn.disabled = true;
  submitBtn.textContent = 'Analyzing with Gemini...';
  statusText.textContent = 'Processing';
  result.textContent = 'Gemini is analyzing your selected mode and uploaded images...';

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    result.textContent = data.analysis;
    statusText.textContent = 'Complete';
  } catch (error) {
    result.textContent = error.message;
    statusText.textContent = 'Error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Run Gemini Vision Analysis';
  }
});

copyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(result.textContent);
  copyBtn.textContent = 'Copied';
  setTimeout(() => {
    copyBtn.textContent = 'Copy Result';
  }, 1200);
});

downloadBtn.addEventListener('click', () => {
  const blob = new Blob([result.textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `vision-ai-report-${Date.now()}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
});
