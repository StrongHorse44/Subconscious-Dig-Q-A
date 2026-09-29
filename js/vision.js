// On-device photo measurement. Everything runs in the browser with the
// vendored MediaPipe build — no image ever leaves the device.
// This file only measures; engine.js decides what the measurements mean.

const VENDOR = new URL('../vendor/', import.meta.url).href;

const MODELS = {
  face: 'models/face_landmarker.task',
  hand: 'models/hand_landmarker.task',
  pose: 'models/pose_landmarker_lite.task'
};

let visionPromise = null;
const tasks = {};

function loadVision() {
  if (!visionPromise) {
    visionPromise = (async () => {
      const mp = await import(VENDOR + 'mediapipe/vision_bundle.mjs');
      const fileset = await mp.FilesetResolver.forVisionTasks(VENDOR + 'mediapipe/wasm');
      return { mp, fileset };
    })();
  }
  return visionPromise;
}

async function getTask(kind) {
  if (!tasks[kind]) {
    tasks[kind] = (async () => {
      const { mp, fileset } = await loadVision();
      const baseOptions = { modelAssetPath: VENDOR + MODELS[kind], delegate: 'CPU' };
      if (kind === 'face') {
        return mp.FaceLandmarker.createFromOptions(fileset, {
          baseOptions, runningMode: 'IMAGE', numFaces: 1,
          outputFaceBlendshapes: true, outputFacialTransformationMatrixes: true
        });
      }
      if (kind === 'hand') {
        return mp.HandLandmarker.createFromOptions(fileset, { baseOptions, runningMode: 'IMAGE', numHands: 1 });
      }
      return mp.PoseLandmarker.createFromOptions(fileset, { baseOptions, runningMode: 'IMAGE', numPoses: 1 });
    })();
    tasks[kind].catch(() => { delete tasks[kind]; });
  }
  return tasks[kind];
}

export async function warmUp(kinds = ['face', 'hand', 'pose']) {
  await Promise.all(kinds.map(getTask));
}

// ---------- geometry helpers ----------
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: (a.z || 0) - (b.z || 0) });
const len = (v) => Math.hypot(v.x, v.y, v.z || 0);
const dist = (a, b) => len(sub(a, b));
const dot = (a, b) => a.x * b.x + a.y * b.y + (a.z || 0) * (b.z || 0);
const angleDeg = (u, v) => Math.acos(Math.max(-1, Math.min(1, dot(u, v) / (len(u) * len(v) || 1)))) * 180 / Math.PI;
const chain = (pts, idx) => idx.slice(1).reduce((s, k, i) => s + dist(pts[idx[i]], pts[k]), 0);

// ---------- face ----------
export async function measureFace(img) {
  const task = await getTask('face');
  const r = task.detect(img);
  if (!r.faceLandmarks?.length) return { found: false };

  const b = {};
  for (const c of r.faceBlendshapes?.[0]?.categories || []) b[c.categoryName] = c.score;
  const pair = (n) => ((b[n + 'Left'] || 0) + (b[n + 'Right'] || 0)) / 2;

  const lm = r.faceLandmarks[0];
  const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
  // Eye outer corners (33, 263) give the head roll in image space.
  const l = lm[33], rr = lm[263];
  const roll = Math.atan2((rr.y - l.y) * h, (rr.x - l.x) * w) * 180 / Math.PI;
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const p of lm) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }

  const lookAway = Math.max(pair('eyeLookOut'), pair('eyeLookIn'), pair('eyeLookUp'), pair('eyeLookDown'));

  return {
    found: true,
    smile: pair('mouthSmile'),
    smileAsym: Math.abs((b.mouthSmileLeft || 0) - (b.mouthSmileRight || 0)),
    cheekSquint: pair('cheekSquint'),
    eyeSquint: pair('eyeSquint'),
    press: Math.max(pair('mouthPress'), ((b.mouthRollLower || 0) + (b.mouthRollUpper || 0)) / 2),
    frown: pair('mouthFrown'),
    browDown: pair('browDown'),
    browInnerUp: b.browInnerUp || 0,
    eyeWide: pair('eyeWide'),
    jawOpen: b.jawOpen || 0,
    jawForward: b.jawForward || 0,
    lookAway,
    roll,
    faceArea: (maxX - minX) * (maxY - minY)
  };
}

// ---------- hand ----------
export async function measureHand(img) {
  const task = await getTask('hand');
  const r = task.detect(img);
  const pts = r.worldLandmarks?.[0] || r.landmarks?.[0];
  if (!pts) return { found: false };

  const palmLength = dist(pts[0], pts[9]);
  const palmWidth = dist(pts[5], pts[17]);
  const middle = chain(pts, [9, 10, 11, 12]);
  const index = chain(pts, [5, 6, 7, 8]);
  const ring = chain(pts, [13, 14, 15, 16]);

  // Project onto the hand's long axis to compare pinky tip with the ring finger's top crease.
  const axis = sub(pts[9], pts[0]);
  const along = (p) => dot(sub(p, pts[0]), axis) / (len(axis) || 1);

  return {
    found: true,
    handedness: r.handedness?.[0]?.[0]?.categoryName || null,
    fingerToPalm: middle / palmLength,
    palmLengthToWidth: palmLength / palmWidth,
    indexToRing: index / ring,
    pinkyReach: (along(pts[20]) - along(pts[15])) / palmLength,
    thumbAngle: angleDeg(sub(pts[4], pts[2]), sub(pts[8], pts[5])),
    fingerSpread: angleDeg(sub(pts[8], pts[5]), sub(pts[20], pts[17]))
  };
}

// ---------- posture (full or half body) ----------
export async function measurePose(img) {
  const task = await getTask('pose');
  const r = task.detect(img);
  const p = r.landmarks?.[0];
  if (!p) return { found: false };
  const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
  const px = (q) => ({ x: q.x * w, y: q.y * h });
  const vis = (i) => (p[i].visibility ?? 1) > 0.5;

  const ls = px(p[11]), rs = px(p[12]);
  const shoulderW = Math.hypot(ls.x - rs.x, ls.y - rs.y) || 1;
  const out = {
    found: true,
    shoulderTilt: Math.abs(Math.atan2(ls.y - rs.y, ls.x - rs.x) * 180 / Math.PI) % 180,
    neckRoom: null, armsCrossed: false, armsOpen: false, stance: null, headTilt: null
  };
  if (out.shoulderTilt > 90) out.shoulderTilt = 180 - out.shoulderTilt;

  if (vis(7) && vis(8)) {
    const le = px(p[7]), re = px(p[8]);
    // Vertical gap between ears and shoulders relative to shoulder width: small = shoulders raised.
    out.neckRoom = (((ls.y + rs.y) / 2) - ((le.y + re.y) / 2)) / shoulderW;
    let t = Math.abs(Math.atan2(le.y - re.y, le.x - re.x) * 180 / Math.PI);
    out.headTilt = t > 90 ? 180 - t : t;
  }
  if (vis(15) && vis(16) && vis(13) && vis(14)) {
    const lw = px(p[15]), rw = px(p[16]), le = px(p[13]), re = px(p[14]);
    const cross = Math.hypot(lw.x - re.x, lw.y - re.y) < shoulderW * 0.45 && Math.hypot(rw.x - le.x, rw.y - le.y) < shoulderW * 0.45;
    out.armsCrossed = cross;
    const minX = Math.min(ls.x, rs.x), maxX = Math.max(ls.x, rs.x);
    out.armsOpen = !cross && (Math.min(lw.x, rw.x) < minX - shoulderW * 0.35 || Math.max(lw.x, rw.x) > maxX + shoulderW * 0.35);
  }
  if (vis(27) && vis(28) && vis(23) && vis(24)) {
    const hipW = Math.abs(p[23].x - p[24].x) * w || 1;
    out.stance = Math.abs(p[27].x - p[28].x) * w / hipW;
  }
  return out;
}

// ---------- light & color (pure canvas, no model) ----------
export function measureColor(img) {
  const size = 48;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, size, size);
  const d = ctx.getImageData(0, 0, size, size).data;
  let sx = 0, sy = 0, satSum = 0, valSum = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
    const sat = max === 0 ? 0 : delta / max;
    let hue = 0;
    if (delta) {
      if (max === r) hue = ((g - b) / delta) % 6;
      else if (max === g) hue = (b - r) / delta + 2;
      else hue = (r - g) / delta + 4;
      hue *= 60; if (hue < 0) hue += 360;
    }
    const wgt = sat * max; // vivid, bright pixels speak loudest
    sx += Math.cos(hue * Math.PI / 180) * wgt; sy += Math.sin(hue * Math.PI / 180) * wgt;
    satSum += sat; valSum += max; n++;
  }
  let hue = Math.atan2(sy, sx) * 180 / Math.PI; if (hue < 0) hue += 360;
  return { hue, saturation: satSum / n, brightness: valSum / n };
}

// A tiny fingerprint so the same photo yields the same phrasing.
export function fingerprint(img) {
  const c = document.createElement('canvas');
  c.width = 8; c.height = 8;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, 8, 8);
  const d = ctx.getImageData(0, 0, 8, 8).data;
  let hsh = 2166136261;
  for (let i = 0; i < d.length; i++) { hsh ^= d[i]; hsh = Math.imul(hsh, 16777619); }
  return hsh >>> 0;
}
