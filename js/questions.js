// Optional questions. The engine picks the ones that best resolve whatever the
// photos left uncertain. Every question can be skipped.

import { PALM_LINES, FOOT_TYPES } from './knowledge.js';

export const CORE_QUESTIONS = [
  {
    id: 'upset', tags: ['absorb', 'heart', 'armor'],
    text: 'When someone near you is upset, what happens in your body?',
    options: [
      { label: 'I feel it like it\'s mine', traits: { absorb: 0.2, heart: 0.1 } },
      { label: 'I want to fix it — now', traits: { fire: 0.1, heart: 0.05, ground: 0.05 } },
      { label: 'I go still and watch', traits: { vision: 0.1, armor: 0.1 } },
      { label: 'I pull away', traits: { armor: 0.2, heart: -0.05 } }
    ]
  },
  {
    id: 'comeTo', tags: ['heart', 'voice', 'vision', 'open'],
    text: 'What do people usually come to you for?',
    options: [
      { label: 'To feel understood', traits: { heart: 0.15, absorb: 0.1 } },
      { label: 'The truth, straight', traits: { voice: 0.15, fire: 0.05 } },
      { label: 'To laugh / lighten up', traits: { open: 0.15, flow: 0.05 } },
      { label: 'Protection or a plan', traits: { ground: 0.15, fire: 0.05 } },
      { label: 'Perspective — "what\'s really going on?"', traits: { vision: 0.15 } }
    ]
  },
  {
    id: 'season', tags: ['armor', 'open', 'ground'],
    text: 'Which feels most true lately?',
    options: [
      { label: 'I\'m building walls', traits: { armor: 0.2, ground: 0.05 } },
      { label: 'My walls are coming down', traits: { open: 0.2, armor: -0.1, absorb: 0.05 } },
      { label: 'I\'m tired in a way sleep doesn\'t fix', traits: { ground: -0.1, absorb: 0.1, armor: 0.05 } },
      { label: 'I\'m restless for something new', traits: { flow: 0.1, open: 0.1, fire: 0.05 } }
    ]
  },
  {
    id: 'night', tags: ['vision', 'source', 'heart', 'flow'],
    text: 'When you\'re alone at night, where does your mind go?',
    options: [
      { label: 'The future — what I\'m building', traits: { fire: 0.1, ground: 0.05 } },
      { label: 'The past — replaying things', traits: { armor: 0.1, heart: 0.05 } },
      { label: 'Other people and how they\'re doing', traits: { absorb: 0.15, heart: 0.05 } },
      { label: 'Big questions — meaning, spirit, the universe', traits: { source: 0.2, vision: 0.05 } },
      { label: 'Ideas, music, things to make', traits: { flow: 0.15, voice: 0.05 } }
    ]
  },
  {
    id: 'rules', tags: ['fire', 'voice', 'ground'],
    text: 'What\'s your relationship with rules?',
    options: [
      { label: 'I make them', traits: { fire: 0.15, ground: 0.05 } },
      { label: 'I follow them — they keep things safe', traits: { ground: 0.15, armor: 0.05 } },
      { label: 'I break them', traits: { fire: 0.1, open: 0.1 } },
      { label: 'I translate them — explain them to people who don\'t get them', traits: { voice: 0.15, vision: 0.05 } }
    ]
  },
  {
    id: 'holdBack', tags: ['voice', 'flow', 'fire', 'armor'],
    text: 'What do you hold back the most?',
    options: [
      { label: 'Anger', traits: { fire: -0.05, armor: 0.1, voice: -0.05 } },
      { label: 'Tears', traits: { heart: -0.05, armor: 0.15 } },
      { label: 'What I really think', traits: { voice: -0.15, vision: 0.05 } },
      { label: 'What I really want', traits: { flow: -0.15, armor: 0.05 } },
      { label: 'Honestly, nothing', traits: { open: 0.15, voice: 0.05 } }
    ]
  },
  {
    id: 'dreams', tags: ['source', 'vision', 'ground'],
    text: 'Your dreams lately feel like…',
    options: [
      { label: 'Vivid, almost like messages', traits: { vision: 0.15, source: 0.1 } },
      { label: 'Being chased, falling, or late', traits: { ground: -0.1, armor: 0.1 } },
      { label: 'Water, oceans, floods', traits: { flow: 0.1, absorb: 0.1 } },
      { label: 'Flying or open spaces', traits: { source: 0.1, open: 0.1 } },
      { label: 'I don\'t remember them', traits: { armor: 0.05 } }
    ]
  },
  {
    id: 'touch', tags: ['ground', 'flow', 'armor'],
    text: 'How do you feel about being hugged unexpectedly?',
    options: [
      { label: 'Love it', traits: { open: 0.1, heart: 0.1 } },
      { label: 'Depends who', traits: { armor: 0.05, ground: 0.05 } },
      { label: 'I freeze for a second', traits: { armor: 0.15, ground: -0.05 } },
      { label: 'I\'m usually the one hugging', traits: { heart: 0.1, flow: 0.05 } }
    ]
  },
  {
    id: 'spirit', tags: ['source'],
    text: 'How close do you feel to something larger than yourself?',
    options: [
      { label: 'Very — it guides me', traits: { source: 0.2 } },
      { label: 'I sense it but don\'t trust it yet', traits: { source: 0.1, vision: 0.05 } },
      { label: 'I used to', traits: { source: -0.05, armor: 0.1 } },
      { label: 'Not really my thing', traits: { source: -0.1, ground: 0.05 } }
    ]
  }
];

export const DESTINATION_QUESTION = {
  id: 'destination', type: 'text',
  text: 'If nobody needed anything from you for a whole year, what would you do?',
  placeholder: 'Write as much or as little as you want…'
};

export function palmQuestions() {
  return Object.entries(PALM_LINES).map(([key, q]) => ({
    id: 'palm_' + key, palm: key, illustrate: 'palm-' + key, text: q.question,
    options: q.options.map((o) => ({ label: o.label, value: o.value, traits: o.traits }))
  }));
}

export function footQuestions() {
  return [
    {
      id: 'foot_type', illustrate: 'foot', text: FOOT_TYPES.question,
      options: FOOT_TYPES.options.map((o) => ({ label: o.label, value: o.value, traits: o.traits }))
    },
    {
      id: 'foot_zone', text: 'Where do your feet ache or feel tense most often?',
      options: [
        { label: 'Toes', value: 'toes', traits: { vision: 0.05, armor: 0.05 } },
        { label: 'Ball of the foot', value: 'ball', traits: { heart: 0.05, absorb: 0.05 } },
        { label: 'Arch', value: 'arch', traits: { fire: 0.05 } },
        { label: 'Heel', value: 'heel', traits: { ground: -0.05 } },
        { label: 'Nowhere really', value: 'none', traits: {} }
      ]
    }
  ];
}
