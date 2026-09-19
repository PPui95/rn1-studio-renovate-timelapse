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
    let stepNum = 0;
    const step = () => (++stepNum);

    const lines = [];
    lines.push(`# WORKFLOW: RN1 Flow ${modeLabel} — ${catLabel()}`);
    lines.push(`หมวดงาน: ${catLabel()} | จำนวนคลิป: ${stages.length} | กล้อง: ${camera.label} | โทนภาพ: ${state.tone}`);
    lines.push('');
    lines.push(`Pipeline ทั้งหมด: [Image Prompt] → ได้ภาพนิ่ง → [Video Prompt ผ่าน "Ingredients to Video"] → ได้คลิปวิดีโอ ~8 วิ → รวมทุกคลิปใน Scenebuilder → วิดีโอฉบับสมบูรณ์`);
    lines.push('');

    lines.push(`## ขั้นตอนที่ ${step()} — เตรียมตัวก่อนเริ่ม`);
    lines.push(`${stepNum}.1 เปิด Google Flow ที่ https://labs.google/fx/tools/flow`);
    lines.push(`${stepNum}.2 ${hasFiles ? `มีภาพอ้างอิงที่อัปโหลดไว้แล้ว ${state.files.length} รูป — ใช้รูปเหล่านั้นแทนการสร้างภาพใหม่ได้เลย (ข้ามขั้นตอน "สร้างภาพ" ของคลิปที่มีรูปตรงกัน)` : 'ยังไม่มีภาพอ้างอิง — แต่ละคลิปด้านล่างจะมีขั้นตอน "สร้างภาพ" ให้ทำก่อน แล้วค่อยนำภาพนั้นไปสร้างวิดีโอ'}`);
    lines.push(`${stepNum}.3 ตั้งค่าโปรเจกต์ในใจ: โหมด = ${modeLabel}, หมวดงาน = ${catLabel()}, โทนภาพ = ${state.tone}, กล้อง = ${camera.label}`);
    if (state.idea.trim()) lines.push(`${stepNum}.4 ไอเดียเพิ่มเติมที่ต้องใส่ในทุกคลิป: "${state.idea.trim()}"`);
    lines.push('');

    stages.forEach((stage, i) => {
      const n = step();
      const hasMatchingFile = hasFiles && i < state.files.length;

      const imagePrompt = `A high-resolution, photorealistic architectural photo of a ${catLabel()} — ${stage.desc}, styled with ${state.tone}. Eye-level, straight-on composition, natural daylight, sharp focus, realistic materials and textures. ${faceInstruction.replace('in the shot', 'in the photo').replace('in at least some clips', 'in the photo')}. Professional real-estate photography, high detail, 4K quality, no text, no watermark.`;

      const videoPrompt = `Animate this image with ${camera.desc}. The scene remains a ${catLabel()} — ${stage.desc}, styled with ${state.tone}. ${faceInstruction}. Cinematic, photorealistic, architectural quality, natural lighting matching the mood of the scene. Audio: ${state.audio}. Duration: approximately 8 seconds.`;

      lines.push(`## ขั้นตอนที่ ${n} — คลิปที่ ${i + 1}: ${stage.label} (${stage.progress})`);

      if (hasMatchingFile) {
        lines.push(`${n}.1 ใช้ภาพที่อัปโหลดไว้รูปที่ ${i + 1} เป็นภาพตั้งต้นของคลิปนี้ได้เลย (ข้าม ${n}.2-${n}.3)`);
      } else {
        lines.push(`${n}.1 สร้างภาพนิ่งก่อน — ใน Flow เลือกโหมด "Image" (หรือใช้ Gemini/ImageFX ก็ได้) แล้ววาง Image Prompt นี้ลงในช่องคำสั่ง:`);
        lines.push(`   "${imagePrompt}"`);
        lines.push(`${n}.2 กด Generate จะได้ภาพนิ่งหลายแบบ เลือกภาพที่ตรงใจที่สุด 1 ภาพ`);
        lines.push(`${n}.3 ถ้าภาพยังไม่ตรง ปรับถ้อยคำใน Image Prompt แล้ว Generate ใหม่จนกว่าจะได้ภาพที่ต้องการ`);
      }

      lines.push(`${n}.4 นำภาพที่ได้ (จากขั้นตอน ${n}.1${hasMatchingFile ? '' : '-' + n + '.3'}) ไปที่โหมด "Ingredients to Video" ในหน้า Flow`);
      lines.push(`${n}.5 วาง Video Prompt นี้ลงในช่องคำสั่ง:`);
      lines.push(`   "${videoPrompt}"`);
      lines.push(`${n}.6 กด Generate แล้วรอผลลัพธ์ (คลิปวิดีโอยาวประมาณ 8 วินาที)`);
      lines.push(`${n}.7 ถ้าผลลัพธ์ยังไม่ตรง ปรับถ้อยคำใน Video Prompt แล้ว Generate ซ้ำ ก่อนไปคลิปถัดไป`);
      lines.push('');
    });

    const lastStep = step();
    lines.push(`## ขั้นตอนที่ ${lastStep} — ประกอบคลิปทั้งหมดเป็นวิดีโอเดียว`);
    lines.push(`${lastStep}.1 เปิด Scenebuilder ใน Flow`);
    lines.push(`${lastStep}.2 ลากคลิปทั้ง ${stages.length} คลิปมาเรียงตามลำดับ: ${stages.map(s => s.label).join(' → ')}`);
    lines.push(`${lastStep}.3 ตรวจสอบความต่อเนื่องของโทนภาพและเสียงระหว่างคลิป ปรับตัดต่อ/ครอปตามต้องการ`);
    lines.push(`${lastStep}.4 กด Export เพื่อได้วิดีโอ ${modeLabel} ฉบับสมบูรณ์`);

    return lines.join('\n');
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
