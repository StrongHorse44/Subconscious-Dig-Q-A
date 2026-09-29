import { measureFace, measureHand, measurePose, measureColor, fingerprint, warmUp } from './vision.js';
import {
  newProfile, interpretFace, interpretThenNow, interpretHand, interpretPose, interpretColor,
  chooseQuestions, applyAnswer, firstRead, composeReading, readingToText
} from './engine.js';

const app = document.getElementById('app');

const SLOTS = [
  { key: 'face', label: 'Your face, now', hint: 'A clear selfie, face toward the camera. Expression is data — don\'t pose, just be.', required: true },
  { key: 'hand', label: 'Your palm', hint: 'Dominant hand, palm to the camera, fingers relaxed and visible.' },
  { key: 'foot', label: 'The sole of your foot', hint: 'For foot reading — toes clearly visible.' },
  { key: 'pose', label: 'Posture', hint: 'Standing naturally, head to at least the hips. Have someone else take it if you can.' },
  { key: 'then', label: 'An older photo of your face', hint: 'Adds a Then vs. Now read — from a year or more ago.' }
];

const state = { files: {}, urls: {}, profile: null, questions: [], qIndex: 0, reading: null, visionError: null };

const md = (s) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const h = (html) => { app.innerHTML = html; window.scrollTo({ top: 0, behavior: 'smooth' }); };

// ------------------------------------------------------------ intro
function renderIntro() {
  h(`
    <section class="center">
      <div class="eyebrow">Subconscious Dig</div>
      <h1>What your body already knows</h1>
      <p class="lede" style="margin:0 auto">Share a few photos. The reading looks at the cues you give off without meaning to — expression, gaze, hands, feet, posture, even the light you live in — then asks a few optional questions before giving you the full breakdown.</p>
      <div class="pillars">
        <div class="pillar"><b>Chakras</b>Where your energy flows and where it's held.</div>
        <div class="pillar"><b>Jung</b>Your archetype, persona and shadow.</div>
        <div class="pillar"><b>Thelema</b>The shape of your True Will.</div>
        <div class="pillar"><b>Body reading</b>Face, palm, foot and posture.</div>
      </div>
      <div class="actions center"><button class="btn" id="begin">Begin the dig</button></div>
      <p class="note" style="text-align:left">Your photos are read entirely on this device. Nothing is uploaded, stored or sent anywhere.</p>
    </section>`);
  document.getElementById('begin').onclick = renderPhotos;
  warmUp(['face']).catch(() => {}); // start loading while they read
}

// ------------------------------------------------------------ photos
function renderPhotos() {
  h(`
    <section>
      <div class="eyebrow">Step 1 of 3</div>
      <h2>Offer the images</h2>
      <p class="lede">Only your face is needed. Every extra photo opens another layer of the reading.</p>
      <div class="slots">
        ${SLOTS.map((s) => `
          <label class="slot ${state.files[s.key] ? 'filled' : ''}" data-key="${s.key}">
            <span class="label">${s.label}</span>
            ${s.required ? '<span class="req">Needed</span>' : '<span class="req" style="color:var(--muted)">Optional</span>'}
            <span class="hint">${s.hint}</span>
            ${state.urls[s.key] ? `<img class="thumb" src="${state.urls[s.key]}" alt="">` : '<span class="plus">+</span>'}
            <input type="file" accept="image/*" aria-label="${s.label}">
          </label>`).join('')}
      </div>
      <div class="actions">
        <button class="btn" id="read" ${state.files.face ? '' : 'disabled'}>Read me</button>
        <button class="link" id="back">Back</button>
      </div>
    </section>`);

  app.querySelectorAll('.slot').forEach((slot) => {
    slot.querySelector('input').addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const key = slot.dataset.key;
      if (state.urls[key]) URL.revokeObjectURL(state.urls[key]);
      state.files[key] = file;
      state.urls[key] = URL.createObjectURL(file);
      renderPhotos();
    });
  });
  document.getElementById('back').onclick = renderIntro;
  document.getElementById('read').onclick = analyze;
}

async function loadImage(url, max = 1280) {
  const img = new Image();
  img.src = url;
  await img.decode();
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * scale);
  c.height = Math.round(img.naturalHeight * scale);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c;
}

// ------------------------------------------------------------ analysis
async function analyze() {
  h(`<section class="center"><div class="orb"></div><h2>Reading the images…</h2><p class="status" id="status">Opening the lens</p></section>`);
  const status = (t) => { const el = document.getElementById('status'); if (el) el.textContent = t; };
  const warnings = [];

  const imgs = {};
  for (const k of Object.keys(state.files)) imgs[k] = await loadImage(state.urls[k]);
  const profile = newProfile(fingerprint(imgs.face));
  state.profile = profile;

  const safely = async (label, fn) => {
    try { return await fn(); } catch (err) {
      console.warn(label, err);
      state.visionError = err;
      return null;
    }
  };

  status('Reading the face — expression, gaze, tension');
  const face = await safely('face', () => measureFace(imgs.face));
  if (face && !face.found) warnings.push('I couldn\'t find a face clearly in your main photo — brighter, straight-on light helps.');
  interpretFace(profile, face);

  if (imgs.then) {
    status('Comparing then and now');
    const then = await safely('then', () => measureFace(imgs.then));
    if (then?.found && face?.found) interpretThenNow(profile, then, face);
    else if (then && !then.found) warnings.push('I couldn\'t find a face in the older photo, so the Then vs. Now read is skipped.');
  }
  if (imgs.hand) {
    status('Reading the hand — palm shape, finger lengths');
    const hand = await safely('hand', () => measureHand(imgs.hand));
    if (hand && !hand.found) warnings.push('I couldn\'t make out the hand clearly — the palm questions will still cover it.');
    interpretHand(profile, hand);
  }
  if (imgs.pose) {
    status('Reading the posture — shoulders, stance, arms');
    const pose = await safely('pose', () => measurePose(imgs.pose));
    if (pose && !pose.found) warnings.push('I couldn\'t find a full body in the posture photo.');
    interpretPose(profile, pose);
  }
  status('Reading the light you live in');
  interpretColor(profile, measureColor(imgs.face));

  if (state.visionError && !face) {
    warnings.push('The photo-reading engine could not start on this device, so this reading leans on the light in your photos and your answers.');
  }

  state.questions = chooseQuestions(profile, { hasHand: !!state.files.hand, hasFoot: !!state.files.foot });
  state.qIndex = 0;
  renderFirstRead(warnings);
}

function renderFirstRead(warnings) {
  const fr = firstRead(state.profile);
  h(`
    <section>
      <div class="eyebrow">The first read</div>
      <h2>${fr.opener}</h2>
      ${warnings.map((w) => `<p class="notice">${w}</p>`).join('')}
      <div class="card">
        <ul class="obs">${fr.observations.map((o) => `<li>${md(o)}</li>`).join('') || '<li>Your photos are quiet — the questions will do more of the work.</li>'}</ul>
      </div>
      <p>${md(fr.hunch)}</p>
      <p class="lede">${fr.bridge}</p>
      <div class="actions">
        <button class="btn" id="q">Answer a few questions</button>
        <button class="link" id="skip">Skip to the full reading</button>
      </div>
    </section>`);
  document.getElementById('q').onclick = renderQuestion;
  document.getElementById('skip').onclick = renderReading;
}

// ------------------------------------------------------------ questions
function palmSvg(line) {
  const hi = (k) => (k === line ? 'var(--accent-2)' : 'rgba(255,255,255,0.25)');
  const w = (k) => (k === line ? 4 : 2);
  return `<svg class="illustration" viewBox="0 0 240 260" role="img" aria-label="Palm lines diagram">
    <path d="M60 250 C50 200 40 170 42 140 L40 70 C40 58 56 58 57 70 L60 118 L66 40 C67 27 84 27 84 40 L86 112 L96 26 C97 12 116 12 115 27 L112 112 L126 40 C128 27 146 29 144 42 L136 124 C150 108 170 96 186 104 C196 110 190 122 182 128 C160 146 152 170 146 196 C142 220 146 238 150 250 Z" fill="rgba(201,168,255,0.06)" stroke="rgba(201,168,255,0.5)" stroke-width="2"/>
    <path d="M44 152 C70 148 98 146 120 134 C128 128 131 120 129 110" fill="none" stroke="${hi('heart')}" stroke-width="${w('heart')}" stroke-linecap="round"/>
    <path d="M142 160 C114 164 84 170 50 186" fill="none" stroke="${hi('head')}" stroke-width="${w('head')}" stroke-linecap="round"/>
    <path d="M142 158 C120 176 110 208 116 246" fill="none" stroke="${hi('life')}" stroke-width="${w('life')}" stroke-linecap="round"/>
    <text x="4" y="146">heart</text><text x="4" y="200">head</text><text x="122" y="236">life</text>
  </svg>`;
}

const TOES = {
  egyptian: [1, 0.85, 0.7, 0.55, 0.4], greek: [0.88, 1, 0.8, 0.6, 0.45], roman: [1, 1, 0.98, 0.7, 0.5],
  square: [0.95, 0.94, 0.93, 0.9, 0.86], celtic: [1, 0.96, 0.6, 0.55, 0.45]
};
function toeSvg(type) {
  const t = TOES[type];
  if (!t) return '';
  const xs = [10, 24, 36, 47, 56], rs = [7, 5.5, 5, 4.5, 4];
  return `<svg viewBox="0 0 64 44" aria-hidden="true">${t.map((v, i) => `<circle cx="${xs[i]}" cy="${40 - v * 30}" r="${rs[i]}" fill="rgba(201,168,255,${0.35 + v * 0.5})"/>`).join('')}</svg>`;
}

function renderQuestion() {
  const qs = state.questions;
  if (state.qIndex >= qs.length) return renderReading();
  const q = qs[state.qIndex];
  const progress = qs.map((_, i) => `<span class="${i < state.qIndex ? 'done' : ''}"></span>`).join('');
  const illustration = q.illustrate?.startsWith('palm-') ? palmSvg(q.illustrate.slice(5)) : '';

  const body = q.type === 'text'
    ? `<textarea id="free" placeholder="${q.placeholder}">${state.profile.answers[q.id] || ''}</textarea>
       <div class="actions"><button class="btn" id="submit">Continue</button><button class="link" id="skipq">Skip</button></div>`
    : `<div class="options">${q.options.map((o, i) => `
         <button class="option ${q.id === 'foot_type' ? 'foot-opt' : ''}" data-i="${i}">
           ${q.id === 'foot_type' ? toeSvg(o.value) : ''}<span>${o.label}</span>
         </button>`).join('')}</div>
       <div class="actions"><button class="link" id="skipq">Skip this one</button><button class="link" id="skipall">Skip to the reading</button></div>`;

  h(`
    <section>
      <div class="eyebrow">Step 2 of 3 · optional</div>
      <div class="progress" aria-label="Question ${state.qIndex + 1} of ${qs.length}">${progress}</div>
      ${illustration}
      <p class="question">${q.text}</p>
      ${body}
    </section>`);

  const next = () => { state.qIndex++; renderQuestion(); };
  app.querySelectorAll('.option').forEach((b) => { b.onclick = () => { applyAnswer(state.profile, q, Number(b.dataset.i)); next(); }; });
  document.getElementById('skipq').onclick = next;
  document.getElementById('skipall')?.addEventListener('click', renderReading);
  document.getElementById('submit')?.addEventListener('click', () => {
    applyAnswer(state.profile, q, document.getElementById('free').value.slice(0, 600));
    next();
  });
}

// ------------------------------------------------------------ reading
function renderReading() {
  const r = composeReading(state.profile);
  state.reading = r;
  const section = (s) => `
    <section class="card section" id="${s.id}">
      <h2>${s.title}</h2>
      ${s.intro ? `<p class="intro">${s.intro}</p>` : ''}
      ${(s.groups || []).map(([name, items]) => `<div class="group-name">${name}</div>${items.map((i) => `<p>${md(i)}</p>`).join('')}`).join('')}
      ${s.chakras ? `<div class="chakra-map">${[...s.chakras].reverse().map((c) => `
        <div class="chakra-row" style="color:${c.color}">
          <span class="chakra-dot" style="opacity:${0.35 + c.level * 0.65}"></span>
          <div>
            <div class="chakra-meta"><span style="color:var(--text)">${c.name} · <em style="color:var(--muted)">${c.sanskrit}</em></span>
              <span class="state">${c.state === 'low' ? 'underactive' : c.state === 'high' ? 'overactive' : 'balanced'}</span></div>
            <div class="bar"><i style="width:${Math.round(c.level * 100)}%;background:${c.color}"></i></div>
          </div>
        </div>`).join('')}</div>` : ''}
      ${(s.paragraphs || []).map((p) => `<p>${md(p)}</p>`).join('')}
      ${s.list ? `<ul class="reflect">${s.list.map((l) => `<li>${l}</li>`).join('')}</ul>` : ''}
    </section>`;

  h(`
    <div class="hero">
      <div class="eyebrow">Step 3 of 3 · Your reading</div>
      <h1>${r.headline}</h1>
      <div style="color:var(--muted)">${r.subhead}</div>
      <p class="essence">${r.essence}</p>
    </div>
    ${r.sections.map(section).join('')}
    <div class="actions center">
      <button class="btn" id="copy">Copy reading</button>
      <button class="btn ghost" id="save">Save as text</button>
      <button class="btn ghost" id="print">Print / PDF</button>
      <button class="link" id="again">Start over</button>
    </div>`);

  const text = readingToText(r);
  document.getElementById('copy').onclick = async (e) => {
    try { await navigator.clipboard.writeText(text); e.target.textContent = 'Copied'; } catch { e.target.textContent = 'Copy failed'; }
  };
  document.getElementById('save').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = 'subconscious-dig-reading.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  document.getElementById('print').onclick = () => window.print();
  document.getElementById('again').onclick = () => {
    Object.values(state.urls).forEach((u) => URL.revokeObjectURL(u));
    Object.assign(state, { files: {}, urls: {}, profile: null, questions: [], qIndex: 0, reading: null, visionError: null });
    renderIntro();
  };
}

renderIntro();
