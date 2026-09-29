import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../js/engine.js';

const neutral = { found: true, smile: 0, smileAsym: 0, cheekSquint: 0, eyeSquint: 0.45, press: 0.02, frown: 0, browDown: 0.3, browInnerUp: 0, eyeWide: 0, jawOpen: 0, jawForward: 0, lookAway: 0.14, roll: 1.7, faceArea: 0.14 };
const smiling = { ...neutral, smile: 0.57, eyeSquint: 0.34, browDown: 0.01, browInnerUp: 0.16, lookAway: 0.62 };

test('a guarded face leans toward armor, a Duchenne smile toward heart', () => {
  const a = E.newProfile(1); E.interpretFace(a, neutral);
  const b = E.newProfile(1); E.interpretFace(b, smiling);
  assert.ok(a.traits.armor > b.traits.armor);
  assert.ok(b.traits.heart > a.traits.heart);
  assert.match(b.observations.face[0], /reaches your eyes/);
});

test('then vs now detects an opening', () => {
  const p = E.newProfile(1);
  E.interpretFace(p, smiling);
  E.interpretThenNow(p, neutral, smiling);
  assert.equal(p.facts.thenNow, 'opened');
  assert.equal(p.observations.then.length, 2);
});

test('hand types follow palm and finger proportions', () => {
  assert.equal(E.classifyHand({ fingerToPalm: 1.07, palmLengthToWidth: 1.44 }), 'water');
  assert.equal(E.classifyHand({ fingerToPalm: 0.9, palmLengthToWidth: 1.2 }), 'earth');
  assert.equal(E.classifyHand({ fingerToPalm: 1.1, palmLengthToWidth: 1.2 }), 'air');
  assert.equal(E.classifyHand({ fingerToPalm: 0.9, palmLengthToWidth: 1.5 }), 'fire');
});

test('full flow produces every section and escapes free text', () => {
  const p = E.newProfile(7);
  E.interpretFace(p, smiling);
  E.interpretColor(p, { hue: 277, saturation: 0.9, brightness: 0.7 });
  const qs = E.chooseQuestions(p, { hasHand: true, hasFoot: true });
  assert.equal(qs.at(-1).id, 'destination');
  qs.forEach((q, i) => E.applyAnswer(p, q, q.type === 'text' ? '<script>x</script>' : i % 2));
  const r = E.composeReading(p);
  const ids = r.sections.map((s) => s.id);
  for (const id of ['body', 'chakras', 'jung', 'will', 'way', 'message', 'reflect']) assert.ok(ids.includes(id), id);
  const will = r.sections.find((s) => s.id === 'will').paragraphs.join(' ');
  assert.ok(!will.includes('<script>'));
  assert.equal(r.sections.find((s) => s.id === 'chakras').chakras.length, 7);
  assert.ok(E.readingToText(r).includes('THELEMIC READ'));
});

test('skipping every question still yields a reading', () => {
  const r = E.composeReading(E.newProfile(3));
  assert.ok(r.headline.length > 0);
});
