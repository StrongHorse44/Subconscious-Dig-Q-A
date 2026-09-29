// Turns photo measurements and answers into a reading.
// Pure functions only (no DOM), so it can be tested in Node.

import {
  TRAITS, CHAKRAS, ARCHETYPES, HAND_TYPES, FINGER_NOTES, PALM_LINES,
  FOOT_TYPES, COLOR_RESONANCE, SUPERCONSCIOUS, REFLECTIONS
} from './knowledge.js';
import { CORE_QUESTIONS, DESTINATION_QUESTION, palmQuestions, footQuestions } from './questions.js';

const BASE = 0.45;
const clamp = (v) => Math.max(0.05, Math.min(0.95, v));

export function newProfile(seed = 1) {
  return {
    seed,
    traits: Object.fromEntries(TRAITS.map((t) => [t, BASE])),
    observations: { face: [], then: [], hand: [], foot: [], pose: [], light: [] },
    facts: {},
    answers: {},
    photos: {}
  };
}

function addTraits(profile, delta, weight = 1) {
  for (const [k, v] of Object.entries(delta || {})) {
    if (k in profile.traits) profile.traits[k] = clamp(profile.traits[k] + v * weight);
  }
}

function observe(profile, area, text, traits) {
  profile.observations[area].push(text);
  addTraits(profile, traits);
}

// Seeded choice so the same inputs give the same phrasing.
function pick(seed, arr) { return arr[Math.abs(seed) % arr.length]; }

// ---------------------------------------------------------------- photos

// How open a face reads, roughly -1 (sealed) .. 1 (wide open).
export function faceOpenness(m) {
  return m.smile * 0.7 + m.cheekSquint * 0.4 + m.jawOpen * 0.2 - m.press * 0.6 - m.browDown * 0.4 - m.frown * 0.3;
}

export function interpretFace(profile, m, area = 'face') {
  if (!m?.found) return;
  profile.photos[area] = m;
  if (area === 'then') return; // the older photo only speaks through the comparison
  const say = (text, traits) => { profile.observations[area].push(text); addTraits(profile, traits); };
  // A smile that reaches the eyes: mouth corners up plus narrowed eyes or lifted cheeks.
  const duchenne = m.smile > 0.4 && (m.cheekSquint > 0.2 || m.eyeSquint > 0.3);

  if (duchenne) {
    say('**Your smile reaches your eyes.** The cheeks lift, the eyes narrow — that is the smile the body cannot fake. When you let joy through, it comes through all the way. The heart center is not theoretical for you.',
      { heart: 0.18, open: 0.2, armor: -0.15, flow: 0.05 });
  } else if (m.smile > 0.4) {
    say('**The smile lives in the mouth more than the eyes.** That is the persona smile — the one Jung would say you offer the world while the real feeling waits somewhere behind it. Not fake. Protective.',
      { voice: 0.08, armor: 0.1, open: 0.05 });
  } else if (m.smile < 0.15) {
    say('**You met the camera without a smile.** Composed, level, watching back. That is the sentinel\'s face: you let people look at you, but not into you. Whatever is behind the eyes is kept under guard.',
      { armor: 0.2, open: -0.1, vision: 0.05, ground: 0.05 });
  }

  if (m.press > 0.25) {
    say('**The lips are pressed.** Something is being held at the throat — words edited before they are spoken.',
      { voice: -0.15, armor: 0.1 });
  }
  // Narrowed, smiling eyes confuse gaze direction, so only read gaze from an unsmiling face.
  if (!duchenne && m.lookAway < 0.3) {
    say('**The gaze goes straight into the lens.** Direct eye contact is a solar plexus signature — you do not flinch from being seen, even when you are not letting anyone in.',
      { fire: 0.1, vision: 0.05 });
  } else if (!duchenne && m.lookAway > 0.45) {
    say('**Your eyes drift off the lens.** Part of you is somewhere inward — the look of someone half listening to a conversation nobody else can hear.',
      { vision: 0.1, source: 0.08, armor: 0.05 });
  }
  if (m.browDown > 0.25) {
    say('**The brow draws down.** Concentration or defense — the forehead of someone scanning for what might go wrong.',
      { fire: 0.08, armor: 0.1 });
  }
  if (m.browInnerUp > 0.3) {
    say('**The inner brow lifts.** That small upward pull is the tell of someone who carries other people\'s worry around with them.',
      { absorb: 0.15, heart: 0.08 });
  }
  if (m.eyeWide > 0.25) {
    say('**The eyes are wide open** — alert, taking everything in. The third eye works overtime in faces like this.',
      { vision: 0.12, armor: 0.03 });
  }
  if (Math.abs(m.roll) > 6) {
    say('**The head tilts.** A tilted head is a question, an invitation — softness and curiosity leaking through.',
      { open: 0.1, flow: 0.05 });
  }
  if (m.smile > 0.2 && m.smileAsym > 0.15) {
    say('**One side of the smile rises higher than the other.** Two selves in one expression — the persona and the person behind it, not quite in agreement.',
      { vision: 0.05, armor: 0.05 });
  }
  if (m.jawForward > 0.2) say('**The jaw sets forward** — determination, a readiness to push through.', { fire: 0.12 });
  if (m.faceArea > 0.22) {
    say('**You came close to the lens.** Filling the frame is an intimate choice — you are willing to be seen up close.', { open: 0.08 });
  } else if (m.faceArea < 0.05) {
    say('**You kept your distance from the lens.** The face is small in the frame — you like to be seen on your own terms, from a safe range.', { armor: 0.1 });
  }
}

export function interpretThenNow(profile, then, now) {
  if (!then?.found || !now?.found) return;
  const delta = faceOpenness(now) - faceOpenness(then);
  const t = profile.traits;
  profile.facts.thenNowDelta = delta;
  if (delta > 0.25) {
    profile.facts.thenNow = 'opened';
    profile.observations.then.push('**The old photo versus the new one tells a story: your True Will got buried under survival.** Whatever you were protecting yourself from in that earlier version — the armor, the deflection, the containment — you built a self around being untouchable.');
    if (t.open > 0.62 || t.absorb > 0.58) {
      profile.observations.then.push('**Then that shell broke, and now you are swinging toward the other extreme** — open, feeling everything, fewer filters. Neither state is your center. Your center is someone who can move between open and protected <em>consciously</em>.');
      profile.facts.swing = true;
    } else {
      profile.observations.then.push('**Now something has come unlocked.** The face in the new photo is letting light out that the old one kept in. That is not an accident; it is a choice you made, maybe without noticing.');
    }
    addTraits(profile, { open: 0.08, heart: 0.05 });
  } else if (delta < -0.25) {
    profile.facts.thenNow = 'closed';
    profile.observations.then.push('**The older photo is more open than the new one.** Something closed between then and now. The light is still there — you can see it in the earlier face — it is just behind a door you learned to keep shut.');
    addTraits(profile, { armor: 0.1 });
  } else {
    profile.facts.thenNow = 'steady';
    profile.observations.then.push('**Then and now, the same face.** Your core expression has held across time — there is something stable in you that circumstances have not rewritten. The question is whether that stability is a foundation or a holding pattern.');
    addTraits(profile, { ground: 0.05 });
  }
}

export function classifyHand(m) {
  // Thresholds are tuned to MediaPipe's joint-based world landmarks, not skin creases.
  const longFingers = m.fingerToPalm >= 1.0;
  const longPalm = m.palmLengthToWidth >= 1.38;
  if (longPalm) return longFingers ? 'water' : 'fire';
  return longFingers ? 'air' : 'earth';
}

export function interpretHand(profile, m) {
  if (!m?.found) return;
  profile.photos.hand = m;
  const type = classifyHand(m);
  profile.facts.handType = type;
  const ht = HAND_TYPES[type];
  observe(profile, 'hand', `**${ht.name}** (${ht.shape}). ${ht.reading}`, ht.traits);

  const notes = [];
  if (m.indexToRing > 1.03) notes.push(FINGER_NOTES.jupiterLong);
  else if (m.indexToRing < 0.96) notes.push(FINGER_NOTES.apolloLong);
  if (m.pinkyReach > 0.02) notes.push(FINGER_NOTES.mercuryLong);
  else if (m.pinkyReach < -0.12) notes.push(FINGER_NOTES.mercuryShort);
  if (m.thumbAngle > 28) notes.push(FINGER_NOTES.wideThumb);
  else if (m.thumbAngle < 15) notes.push(FINGER_NOTES.closeThumb);
  if (m.fingerSpread > 22) notes.push(FINGER_NOTES.spreadFingers);
  else if (m.fingerSpread < 10) notes.push(FINGER_NOTES.closedFingers);
  for (const n of notes) observe(profile, 'hand', n.text, n.traits);
}

export function interpretPose(profile, m) {
  if (!m?.found) return;
  profile.photos.pose = m;
  if (m.shoulderTilt > 5) observe(profile, 'pose', '**One shoulder sits higher than the other.** Body readers see this as carrying a load on one side — a responsibility or a person you have been holding up for a long time.', { absorb: 0.1, armor: 0.05 });
  if (m.neckRoom !== null && m.neckRoom < 0.32) observe(profile, 'pose', '**The shoulders ride up toward the ears.** That is bracing — the body waiting for impact. In Reichian terms, armor held in the shoulders and neck.', { armor: 0.15, voice: -0.05 });
  if (m.armsCrossed) observe(profile, 'pose', '**Arms cross the body.** A shield over the heart and solar plexus — comfort, or protection, or both.', { armor: 0.15, heart: -0.05 });
  if (m.armsOpen) observe(profile, 'pose', '**The arms open away from the body.** Expansive, available — you take up space and let the front of you be exposed.', { open: 0.15, fire: 0.05 });
  if (m.stance !== null && m.stance > 1.4) observe(profile, 'pose', '**A wide stance.** You plant yourself. The root chakra shows up physically as feet that claim ground.', { ground: 0.15, fire: 0.05 });
  if (m.stance !== null && m.stance < 0.8) observe(profile, 'pose', '**The feet stand close together.** A narrow base — light on the earth, ready to move, not quite settled.', { ground: -0.1, open: 0.05 });
  if (m.headTilt !== null && m.headTilt > 7) observe(profile, 'pose', '**The head tilts off center.** A listening posture — curious and receptive.', { open: 0.08, vision: 0.05 });
  if (!profile.observations.pose.length) observe(profile, 'pose', '**The posture is level and centered.** No obvious bracing, no collapse — the body is not shouting anything, which is its own kind of steadiness.', { ground: 0.08 });
}

export function interpretColor(profile, c) {
  if (!c) return;
  profile.facts.color = c;
  if (c.saturation > 0.28) {
    const res = COLOR_RESONANCE.find((r) => c.hue < r.maxHue);
    const trait = CHAKRAS.find((ch) => ch.key === res.chakra).trait;
    profile.facts.colorChakra = res.chakra;
    observe(profile, 'light', res.text, { [trait]: 0.08 });
  } else {
    observe(profile, 'light', 'The light in your photos is muted and neutral. You are not asking your surroundings to say much about you — the setting stays quiet so you can stay private.', { armor: 0.05 });
  }
  if (c.brightness < 0.32) observe(profile, 'light', 'You are photographed in dim, night-time light. Some people are most themselves after dark, when the world asks less of them.', { vision: 0.05, source: 0.03 });
}

// ---------------------------------------------------------------- questions

function uncertainty(v) { return 1 - Math.abs(v - 0.5) * 2; }

export function chooseQuestions(profile, { hasHand = false, hasFoot = false, count = 5 } = {}) {
  const scored = CORE_QUESTIONS.map((q, i) => ({
    q,
    s: q.tags.reduce((s, t) => s + uncertainty(profile.traits[t]), 0) / q.tags.length + ((profile.seed >> i) & 1) * 0.01
  })).sort((a, b) => b.s - a.s);
  const out = scored.slice(0, count).map((x) => x.q);
  if (hasHand) out.push(...palmQuestions());
  if (hasFoot) out.push(...footQuestions());
  out.push(DESTINATION_QUESTION);
  return out;
}

export function applyAnswer(profile, question, answer) {
  if (answer === null || answer === undefined || answer === '') return;
  profile.answers[question.id] = answer;
  if (question.type === 'text') return;
  const opt = question.options[answer];
  if (!opt) return;
  addTraits(profile, opt.traits);
  if (question.palm) {
    const line = PALM_LINES[question.palm].options.find((o) => o.value === opt.value);
    if (line?.text) profile.observations.hand.push(line.text);
  }
  if (question.id === 'foot_type') {
    const ft = FOOT_TYPES.options.find((o) => o.value === opt.value);
    profile.facts.footType = ft.value;
    profile.observations.foot.push(ft.text);
  }
  if (question.id === 'foot_zone' && FOOT_TYPES.zones[opt.value]) {
    profile.observations.foot.push(`In reflexology, tension in the ${opt.label.toLowerCase()} maps to ${FOOT_TYPES.zones[opt.value]}.`);
  }
}

// ---------------------------------------------------------------- synthesis

// Answers and cues pile up, so the seven energy traits are read relative to
// each other: what matters is which centers lead and which lag.
const ENERGY = ['ground', 'flow', 'fire', 'heart', 'voice', 'vision', 'source'];
export function relativeTraits(traits) {
  const mean = ENERGY.reduce((s, t) => s + traits[t], 0) / ENERGY.length;
  const out = { ...traits };
  for (const t of ENERGY) out[t] = clamp(0.5 + (traits[t] - mean) * 1.8);
  return out;
}

export function chakraLevels(rawTraits) {
  const traits = relativeTraits(rawTraits);
  const armor = traits.armor - BASE;
  return CHAKRAS.map((c) => {
    let v = traits[c.trait];
    if (c.key === 'heart') v -= armor * 0.35 - (traits.absorb - BASE) * 0.2;
    if (c.key === 'throat') v -= armor * 0.25;
    if (c.key === 'root') v += armor * 0.1;
    v = clamp(v);
    const state = v < 0.38 ? 'low' : v > 0.66 ? 'high' : 'balanced';
    return { ...c, level: v, state, text: c[state] };
  });
}

export function rankArchetypes(rawTraits) {
  const traits = relativeTraits(rawTraits);
  return ARCHETYPES.map((a) => {
    const sig = Object.entries(a.signature);
    const total = sig.reduce((s, [, w]) => s + w, 0);
    const score = sig.reduce((s, [t, w]) => s + w * traits[t], 0) / total;
    return { ...a, score };
  }).sort((x, y) => y.score - x.score);
}

export function chooseMessages(profile, dominant) {
  const t = profile.traits;
  const rules = [
    ['center', profile.facts.swing ? 1 : 0],
    ['boundaries', t.absorb - 0.58],
    ['rest', Math.min(t.armor, t.ground) - 0.55],
    ['speak', 0.4 - t.voice],
    ['soften', Math.min(t.fire - 0.62, 0.5 - t.heart)],
    ['descend', Math.min(t.source - 0.62, 0.48 - t.ground)],
    ['direction', ['hermes', 'healer', 'caregiver'].includes(dominant.key) ? 0.05 : -1],
    ['stay', dominant.key === 'explorer' ? 0.05 : -1],
    ['play', 0.001]
  ].filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]);
  return rules.slice(0, 2).map(([k]) => ({ key: k, text: SUPERCONSCIOUS[k] }));
}

function escapeText(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[ch]));
}

// The quick impression shown before the questions.
export function firstRead(profile) {
  const [top, second] = rankArchetypes(profile.traits);
  const obs = [...profile.observations.face, ...profile.observations.pose, ...profile.observations.hand].slice(0, 3);
  const opener = pick(profile.seed, [
    'Here is what comes through first.',
    'Before you say a word, the photos are already talking.',
    'First impressions, straight from the images.'
  ]);
  return {
    opener,
    observations: obs,
    hunch: `At first glance you read as **${top.name}** (${top.mythic}), with **${second.name}** close behind. ${top.essence}`,
    bridge: 'A few optional questions will sharpen this. Skip anything you want — the reading works either way.'
  };
}

export function composeReading(profile) {
  const ranked = rankArchetypes(profile.traits);
  const [dominant, secondary] = ranked;
  const chakras = chakraLevels(profile.traits);
  const lowest = [...chakras].sort((a, b) => a.level - b.level)[0];
  const highest = [...chakras].sort((a, b) => b.level - a.level)[0];
  const messages = chooseMessages(profile, dominant);
  const destination = (profile.answers.destination || '').trim();
  const o = profile.observations;
  const sections = [];

  sections.push({
    id: 'body', title: 'What the Body Is Saying',
    intro: 'Practitioners who read bodies — Reichian therapists, somatic workers, palm and foot readers — all start from the same idea: the body keeps the score of what the mind will not say.',
    groups: [
      ['Face', o.face], ['Posture', o.pose], ['Hand', o.hand], ['Feet', o.foot], ['The light you chose', o.light]
    ].filter(([, items]) => items.length)
  });

  if (o.then.length) sections.push({ id: 'then', title: 'Then vs. Now', paragraphs: o.then });

  sections.push({
    id: 'chakras', title: 'The Energy Map', chakras,
    intro: 'The lower three centers (root, sacral, solar plexus) govern survival, desire and power. The heart is the bridge. The upper three (throat, third eye, crown) govern expression, perception and connection to source.',
    paragraphs: [
      highest.state === 'high'
        ? `**Where energy pools: the ${highest.name}.** ${highest.text}`
        : `**Your strongest center: the ${highest.name}** — ${highest.domain}. ${highest.text}`,
      lowest.state === 'low'
        ? `**Where it is constricted: the ${lowest.name}.** ${lowest.text}`
        : `**Your quietest center: the ${lowest.name}** — ${lowest.domain}. Not blocked, but it gets the least of your energy right now.`
    ]
  });

  const shadowArch = ranked[ranked.length - 1];
  sections.push({
    id: 'jung', title: 'The Jungian Read',
    paragraphs: [
      `**Your dominant archetype is ${dominant.name}** — ${dominant.mythic}. ${dominant.essence} ${dominant.gift}`,
      `**Your secondary archetype is ${secondary.name}.** ${secondary.gift}`,
      `**The Persona and the Shadow.** The persona is the face you offer the world — and your photos show a lot of ${profile.traits.armor > 0.55 ? 'control in that face' : 'openness in that face'}. The shadow is what gets exiled. Yours carries the energy of ${shadowArch.name} — the part of you that is ${shadowArch.essence.replace(/^You are here to /, 'here to ').replace(/^You are /, '').replace(/\.$/, '')}. What you disown does not disappear; it waits.`,
      `**The shadow of your gift:** ${dominant.shadow}`
    ]
  });

  const [willLead, ...willRest] = dominant.trueWill.split('. ');
  const willParas = [
    `**${willLead.replace(/\.$/, '')}.** ${willRest.join('. ')}`.trim(),
    `It moves through the gift of ${secondary.name.replace(/^The /, 'the ')}: ${secondary.essence.charAt(0).toLowerCase() + secondary.essence.slice(1)}`
  ];
  if (destination) {
    willParas.push(`You said that if nobody needed anything from you, you would: <em>"${escapeText(destination)}"</em>. Read that back slowly. Crowley would call that a clue — True Will is rarely the loud ambition; it is the thing you would do anyway.`);
  }
  willParas.push(`**The danger for ${dominant.name.replace(/^The /, 'a ')} type:** ${dominant.danger}`);
  sections.push({ id: 'will', title: 'Thelemic Read — True Will', paragraphs: willParas });

  sections.push({
    id: 'way', title: 'What Is Standing in the Way',
    paragraphs: [
      lowest.state === 'low'
        ? `**The ${lowest.name} is where the work is.** ${lowest.text}`
        : `**Your growth edge is the ${lowest.name}** — ${lowest.domain}. It is the center that asks for more of your attention than it gets.`,
      profile.traits.absorb > 0.58
        ? '**You have not yet learned to distinguish your own emotions from everyone else\'s.** Until you do, the gift runs you instead of you running the gift.'
        : profile.traits.armor > 0.58
          ? '**The armor that kept you safe is now keeping you out** — out of your own softness, out of rooms that would welcome you.'
          : '**You are more ready than you think.** The obstacle is less a wall than a habit of waiting.'
    ]
  });

  sections.push({
    id: 'message', title: 'The Superconscious Message',
    intro: 'In yogic terms this is the Atman; for Jung, the Self; in the Western mystery tradition, the Holy Guardian Angel — the layer of you that already sees the whole path.',
    paragraphs: messages.map((m, i) => {
      if (i > 0) return m.text;
      const [lead, ...rest] = m.text.split('. ');
      return `What is trying to come through: <em>${lead.replace(/\.$/, '')}.</em> ${rest.join('. ')}`.trim();
    })
  });

  const reflectTraits = [lowest.trait, profile.traits.armor > 0.55 ? 'armor' : 'open', profile.traits.absorb > 0.55 ? 'absorb' : highest.trait];
  sections.push({
    id: 'reflect', title: 'What\'s Your Read?',
    paragraphs: ['A reading is a mirror, not a verdict. Sit with whichever of these lands hardest:'],
    list: [...new Set(reflectTraits)].map((t) => REFLECTIONS[t])
  });

  return {
    headline: `${dominant.name}`,
    subhead: `${dominant.mythic} · with ${secondary.name}`,
    essence: dominant.essence,
    archetypes: ranked.slice(0, 3).map((a) => ({ key: a.key, name: a.name, score: a.score })),
    sections
  };
}

export function readingToText(reading) {
  const strip = (s) => s.replace(/\*\*/g, '').replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const lines = [`SUBCONSCIOUS DIG — ${reading.headline}`, reading.subhead, '', strip(reading.essence), ''];
  for (const s of reading.sections) {
    lines.push(s.title.toUpperCase());
    if (s.intro) lines.push(strip(s.intro));
    for (const [name, items] of s.groups || []) { lines.push(`— ${name}`); items.forEach((i) => lines.push(strip(i))); }
    for (const c of s.chakras || []) lines.push(`${c.name} (${c.sanskrit}): ${c.state === 'low' ? 'underactive' : c.state === 'high' ? 'overactive' : 'balanced'}`);
    for (const p of s.paragraphs || []) lines.push(strip(p));
    for (const l of s.list || []) lines.push(`• ${strip(l)}`);
    lines.push('');
  }
  lines.push('For reflection and self-exploration — not a diagnosis or a prediction.');
  return lines.join('\n');
}
