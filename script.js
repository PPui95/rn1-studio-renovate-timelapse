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

  const state = {
    mode: 'renovate',
    category: 'house',
    shots: 8,
    tone: document.getElementById('toneSelect').value,
    face: 'ไม่เห็นหน้า',
    audio: 'ให้ AI เลือกเสียงที่เหมาะสมเอง',
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

  document.getElementById('shotsRow').addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    state.shots = Number(btn.dataset.shots);
    document.querySelectorAll('#shotsRow .chip').forEach(b => b.classList.toggle('active', b === btn));
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
    state.files = Array.from(fileList).slice(0, 6);
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

  function buildPrompt() {
    const modeLabel = state.mode === 'renovate' ? 'Renovate (ปรับปรุง/ตกแต่ง)' : 'Timelapse (ไทม์แลปส์ขั้นตอนก่อสร้าง)';
    const sequenceLabel = state.mode === 'renovate'
      ? 'ก่อนปรับปรุง → ระหว่างปรับปรุง → หลังปรับปรุงเสร็จสมบูรณ์'
      : 'เริ่มต้น (โครงสร้าง 0%) → ระหว่างก่อสร้าง (50%) → เสร็จสมบูรณ์ (100%)';
    const faceInstruction = {
      'ไม่เห็นหน้า': 'ห้ามมีใบหน้าคนปรากฏชัดเจนในภาพทุกช็อต ถ้ามีคนให้เห็นแค่ด้านหลังหรือมุมที่บังใบหน้า',
      'ลูกผสม': 'ให้มีทั้งช็อตที่ไม่เห็นหน้าคนและช็อตที่เห็นหน้าคนผสมกัน เพื่อความเป็นธรรมชาติ',
      'เห็นหน้าคน': 'ให้มีคนและเห็นใบหน้าชัดเจนในบางช็อตเพื่อสื่อถึงการใช้งานจริงของพื้นที่',
    }[state.face];

    const refNote = state.files.length > 0
      ? `มีภาพอ้างอิงแนบมาด้วย ${state.files.length} รูป ให้วิเคราะห์สภาพ/สไตล์/วัสดุจากภาพก่อน แล้วใช้เป็นจุดตั้งต้นของงาน`
      : 'ไม่มีภาพอ้างอิงแนบมา ให้ AI คิดไอเดียที่เหมาะสมกับหมวดงานนี้ขึ้นมาเอง';

    const ideaNote = state.idea.trim()
      ? `ไอเดียเพิ่มเติมจากผู้ใช้: "${state.idea.trim()}"`
      : 'ไม่มีไอเดียเพิ่มเติม ให้ AI ออกแบบอย่างสร้างสรรค์ตามความเหมาะสม';

    return `# RN1 MASTER PROMPT — ${modeLabel}
หมวดงาน: ${catLabel()} | จำนวนช็อต: ${state.shots} ภาพ | โทนภาพ: ${state.tone}

**วางคำสั่งนี้ในแชท ChatGPT หรือ Gemini แล้วแนบภาพอ้างอิงของคุณ (ถ้ามี) ในข้อความเดียวกัน**

## บริบทของงาน
- ประเภทงาน: ${catLabel()} (โหมด ${modeLabel})
- ลำดับการนำเสนอ: ${sequenceLabel}
- จำนวนภาพทั้งหมด: ${state.shots} ช็อต
- โทนภาพหลัก: ${state.tone}
- ${refNote}
- ${ideaNote}

## สิ่งที่ต้องการให้ AI ทำ
1. วิเคราะห์สภาพเริ่มต้น/โจทย์ของงานจากภาพหรือคำอธิบายข้างต้น
2. ออกแบบลำดับภาพทั้งหมด ${state.shots} ช็อต ตามลำดับ: ${sequenceLabel}
3. ควบคุมโทนภาพให้เป็น "${state.tone}" ตลอดทุกช็อตเพื่อความสม่ำเสมอ
4. ${faceInstruction}
5. อธิบายแต่ละช็อตให้ละเอียดพอที่จะนำไปใช้เป็น prompt สร้างภาพได้ทันที ประกอบด้วย มุมกล้อง, แสง, วัสดุ/พื้นผิว, องค์ประกอบเด่น และสิ่งที่เปลี่ยนไปจากช็อตก่อนหน้า
6. เสียงประกอบ (ถ้าทำเป็นวิดีโอ/ไทม์แลปส์): ${state.audio}

## รูปแบบผลลัพธ์ที่ต้องการ
ตอบกลับเป็นลิสต์ Shot 1 ถึง Shot ${state.shots} โดยแต่ละช็อตมีหัวข้อดังนี้:
- **Shot [เลขที่]**
  - คำอธิบายภาพ: ...
  - มุมกล้อง/องค์ประกอบ: ...
  - สิ่งที่เปลี่ยนจากช็อตก่อนหน้า: ...
  - Prompt สำหรับสร้างภาพ (ภาษาอังกฤษ): ...

หลังจากลิสต์ครบทุกช็อต ให้สรุปแนวทางโทนสี/สไตล์โดยรวมของงานชุดนี้ปิดท้ายสั้นๆ 1 ย่อหน้า`;
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
