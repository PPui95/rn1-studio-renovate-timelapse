(() => {
  const CATEGORIES = {
    renovate: [
      { id: 'house', icon: '🏠', label: 'บ้าน' },
      { id: 'condo', icon: '🏢', label: 'คอนโด/ตึก' },
      { id: 'kitchen', icon: '🍳', label: 'ครัว' },
      { id: 'bedroom', icon: '🛏️', label: 'ห้องนอน' },
      { id: 'living', icon: '🛋️', label: 'ห้องนั่งเล่น' },
      { id: 'garden', icon: '🌳', label: 'สวน/ลาน' },
      { id: 'pool', icon: '🏊', label: 'สระว่ายน้ำ' },
      { id: 'other', icon: '➕', label: 'อื่นๆ' },
    ],
    timelapse: [
      { id: 'house', icon: '🏠', label: 'บ้าน' },
      { id: 'building', icon: '🏢', label: 'ตึก' },
      { id: 'car', icon: '🚗', label: 'รถ' },
      { id: 'boat', icon: '⛵', label: 'เรือ' },
      { id: 'pool', icon: '🏊', label: 'สระว่ายน้ำ' },
      { id: 'garden', icon: '🌳', label: 'สวน/ลาน' },
      { id: 'plane', icon: '✈️', label: 'เครื่องบิน' },
      { id: 'other', icon: '➕', label: 'อื่นๆ' },
    ],
  };

  const CAMERA_MOVES = {
    static: { label: 'นิ่ง (Static)', desc: 'a static, locked-off camera shot with no camera movement, letting the scene itself change within the frame' },
    dolly: { label: 'เลื่อนเข้า (Dolly In)', desc: 'a slow, smooth dolly-in camera movement, gradually pushing toward the main subject' },
    pan: { label: 'แพนกล้อง (Pan)', desc: 'a smooth horizontal pan across the scene, gradually revealing more of the space' },
    orbit: { label: 'หมุนรอบ (Orbit)', desc: 'a slow orbiting arc shot circling around the subject or building' },
    crane: { label: 'เครนสำรวจ (Crane Reveal)', desc: 'a slow crane-up reveal shot, rising to show a wider view of the scene' },
    walk: { label: 'เดินสำรวจ (Walkthrough)', desc: 'a handheld walkthrough shot, moving forward as if walking through the space' },
  };

  const state = {
    mode: 'renovate',
    category: 'house',
    clips: 2,
    tone: document.getElementById('toneSelect').value,
    face: 'ไม่เห็นหน้า',
    camera: 'static',
    audio: 'ให้ AI เลือกเสียงที่เหมาะสมกับฉากเอง',
    idea: '',
    files: [],
  };

  const categoryGrid = document.getElementById('categoryGrid');
  const toneSelect = document.getElementById('toneSelect');
  const toneCustom = document.getElementById('toneCustom');
  const swatchRow = document.getElementById('swatchRow');
  const uploadBox = document.getElementById('uploadBox');
  const refUpload = document.getElementById('refUpload');
  const uploadPreview = document.getElementById('uploadPreview');
  const uploadHint = document.getElementById('uploadHint');

  function renderCategories() {
    categoryGrid.innerHTML = '';
    const list = CATEGORIES[state.mode];
    if (!list.find(c => c.id === state.category)) state.category = list[0].id;
    list.forEach(cat => {
      const div = document.createElement('div');
      div.className = 'cat-card' + (cat.id === state.category ? ' active' : '');
      div.dataset.cat = cat.id;
      div.innerHTML = `<span class="cat-icon">${cat.icon}</span>${cat.label}`;
      div.addEventListener('click', () => {
        state.category = cat.id;
        renderCategories();
      });
      categoryGrid.appendChild(div);
    });
  }

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.mode = btn.dataset.mode;
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.nav-btn[data-mode]').forEach(n => n.classList.toggle('active', n.dataset.mode === state.mode));
      renderCategories();
    });
  });

  document.querySelectorAll('.nav-btn[data-mode]').forEach(navBtn => {
    navBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const mode = navBtn.dataset.mode;
      const targetBtn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
      if (targetBtn) targetBtn.click();
      document.getElementById('builder').scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.getElementById('clipsRow').addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    state.clips = Number(btn.dataset.clips);
    document.querySelectorAll('#clipsRow .chip').forEach(b => b.classList.toggle('active', b === btn));
  });

  document.getElementById('cameraRow').addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    state.camera = btn.dataset.camera;
    document.querySelectorAll('#cameraRow .chip').forEach(b => b.classList.toggle('active', b === btn));
  });

  document.getElementById('faceRow').addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    state.face = btn.dataset.face;
    document.querySelectorAll('#faceRow .chip').forEach(b => b.classList.toggle('active', b === btn));
  });

  document.getElementById('audioRow').addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    state.audio = btn.dataset.audio;
    document.querySelectorAll('#audioRow .chip').forEach(b => b.classList.toggle('active', b === btn));
  });

  toneSelect.addEventListener('change', () => {
    if (toneSelect.value === 'กำหนดเอง') {
      toneCustom.style.display = 'block';
      state.tone = toneCustom.value || 'โทนภาพตามที่ผู้ใช้กำหนดเอง';
    } else {
      toneCustom.style.display = 'none';
      state.tone = toneSelect.value;
    }
  });
  toneCustom.addEventListener('input', () => {
    if (toneSelect.value === 'กำหนดเอง') state.tone = toneCustom.value || 'โทนภาพตามที่ผู้ใช้กำหนดเอง';
  });

  swatchRow.addEventListener('click', (e) => {
    const sw = e.target.closest('.swatch');
    if (!sw) return;
    document.querySelectorAll('.swatch').forEach(s => s.classList.toggle('active', s === sw));
    state.colorAccent = sw.dataset.color;
  });

  document.getElementById('ideaText').addEventListener('input', (e) => {
    state.idea = e.target.value;
  });

  uploadBox.addEventListener('click', () => refUpload.click());
  uploadBox.addEventListener('dragover', (e) => { e.preventDefault(); uploadBox.style.borderColor = 'var(--accent)'; });
  uploadBox.addEventListener('dragleave', () => { uploadBox.style.borderColor = ''; });
  uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '';
    handleFiles(e.dataTransfer.files);
  });
  refUpload.addEventListener('change', () => handleFiles(refUpload.files));

  function handleFiles(fileList) {
    state.files = Array.from(fileList).slice(0, 4);
    uploadPreview.innerHTML = '';
    if (state.files.length === 0) {
      uploadHint.style.display = 'block';
      return;
    }
    uploadHint.style.display = 'none';
    state.files.forEach(file => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      uploadPreview.appendChild(img);
    });
  }

  function catLabel() {
    const list = CATEGORIES[state.mode];
    const found = list.find(c => c.id === state.category);
    return found ? found.label : 'งานทั่วไป';
  }

  function getStages() {
    const modeWord = state.mode === 'renovate' ? 'ปรับปรุง' : 'ก่อสร้าง';
    if (state.clips === 1) {
      return [{ label: `ก่อน → หลัง${modeWord}`, progress: '0% → 100%', desc: 'the full transformation compressed into one continuous clip' }];
    }
    if (state.clips === 2) {
      return [
        { label: `ก่อน${modeWord}`, progress: '0%', desc: 'the starting condition, before any work has begun' },
        { label: `หลัง${modeWord}เสร็จ`, progress: '100%', desc: 'the fully finished result' },
      ];
    }
    if (state.clips === 3) {
      return [
        { label: `ก่อน${modeWord}`, progress: '0%', desc: 'the starting condition, before any work has begun' },
        { label: 'ระหว่างดำเนินการ', progress: '50%', desc: 'work actively in progress, midway through the transformation' },
        { label: `หลัง${modeWord}เสร็จ`, progress: '100%', desc: 'the fully finished result' },
      ];
    }
    return [
      { label: `ก่อน${modeWord}`, progress: '0%', desc: 'the starting condition, before any work has begun' },
      { label: 'ช่วงต้นของงาน', progress: '35%', desc: 'early-stage work just getting underway' },
      { label: 'ช่วงใกล้เสร็จ', progress: '70%', desc: 'work nearly complete, finishing touches underway' },
      { label: `หลัง${modeWord}เสร็จ`, progress: '100%', desc: 'the fully finished result' },
    ];
  }

  function buildPrompt() {
    const modeLabel = state.mode === 'renovate' ? 'Renovate (ปรับปรุง/ตกแต่ง)' : 'Timelapse (ไทม์แลปส์ขั้นตอนก่อสร้าง)';
    const camera = CAMERA_MOVES[state.camera];
    const faceInstruction = {
      'ไม่เห็นหน้า': 'no clearly visible human faces in the shot; if a person appears, keep them turned away or out of clear focus',
      'ลูกผสม': 'a natural mix — some clips may show people clearly, others may not',
      'เห็นหน้าคน': 'include people with clearly visible faces in at least some clips, to show the space being used',
    }[state.face];

    const stages = getStages();
    const hasFiles = state.files.length > 0;

    const header = `# RN1 FLOW PROMPT — ${modeLabel}
หมวดงาน: ${catLabel()} | จำนวนคลิป: ${stages.length} | กล้อง: ${camera.label} | โทนภาพ: ${state.tone}

**วิธีใช้ใน Google Flow:** เปิด https://labs.google/fx/tools/flow → เลือกโหมด "Ingredients to Video" → อัปโหลดภาพอ้างอิงของคลิปนั้น (ถ้ามี) → วาง Prompt ของคลิปนั้นในช่องคำสั่ง → กด Generate (ได้คลิปยาวประมาณ 8 วินาที/ครั้ง) → ทำซ้ำทีละคลิปตามลำดับด้านล่าง แล้วนำคลิปทั้งหมดไปต่อกันใน Scenebuilder

${hasFiles ? `มีภาพอ้างอิงแนบมาด้วย ${state.files.length} รูป ให้ใช้เป็น Ingredients ของแต่ละคลิปตามลำดับ` : 'ไม่มีภาพอ้างอิงแนบมา ให้ Flow สร้างฉากขึ้นเองตาม Prompt ข้อความล้วน (text-to-video)'}
${state.idea.trim() ? `ไอเดียเพิ่มเติมจากผู้ใช้: "${state.idea.trim()}"` : ''}
`;

    const clipBlocks = stages.map((stage, i) => {
      const refNote = hasFiles
        ? `ภาพอ้างอิงที่ใช้: รูปที่ ${Math.min(i + 1, state.files.length)} ที่อัปโหลดไว้ (หรือรูปที่ใกล้เคียงสถานะ "${stage.label}" ที่สุด)`
        : `ภาพอ้างอิง: ไม่มี — ให้ Flow สร้างฉากจาก Prompt ข้อความล้วนด้านล่าง`;

      const flowPrompt = `${camera.desc}. The scene shows a ${catLabel()} — ${stage.desc}, styled with ${state.tone}. ${faceInstruction}. Cinematic, photorealistic, architectural quality, natural lighting matching the mood of the scene. Audio: ${state.audio}. Duration: approximately 8 seconds.`;

      return `## คลิปที่ ${i + 1} — ${stage.label} (${stage.progress})
${refNote}

**Prompt (วางในช่อง Flow):**
${flowPrompt}`;
    }).join('\n\n');

    return `${header}
${clipBlocks}

## หลังจากได้ครบทุกคลิป
นำคลิปทั้งหมดไปเรียงต่อกันใน Flow Scenebuilder ตามลำดับ ${stages.map(s => s.label).join(' → ')} เพื่อให้ได้วิดีโอ ${modeLabel} ฉบับสมบูรณ์`;
  }

  document.getElementById('generateBtn').addEventListener('click', () => {
    const output = buildPrompt();
    document.getElementById('outputText').value = output;
    const panel = document.getElementById('outputPanel');
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('copyBtn').addEventListener('click', async () => {
    const textarea = document.getElementById('outputText');
    try {
      await navigator.clipboard.writeText(textarea.value);
    } catch (err) {
      textarea.select();
      document.execCommand('copy');
    }
    const btn = document.getElementById('copyBtn');
    btn.textContent = '✅ คัดลอกแล้ว';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📋 คัดลอก';
      btn.classList.remove('copied');
    }, 1800);
  });

  renderCategories();
})();
