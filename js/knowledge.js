// The interpretation library. Every reading is assembled from this file.
// Traits are scored 0..1 and drive everything else:
//   ground  root / safety / stability          flow    sacral / desire / creativity
//   fire    solar plexus / will / power         heart   love / empathy / connection
//   voice   throat / expression / truth         vision  third eye / intuition / insight
//   source  crown / spirit / meaning            armor   guardedness / protection
//   absorb  porous boundaries / empathic load   open    openness / receptivity

export const TRAITS = ['ground', 'flow', 'fire', 'heart', 'voice', 'vision', 'source', 'armor', 'absorb', 'open'];

export const CHAKRAS = [
  {
    key: 'root', trait: 'ground', name: 'Root', sanskrit: 'Muladhara', color: '#c0392b',
    domain: 'survival, safety, belonging, the body',
    low: 'The root reads thin. Some part of you has never fully believed the ground will hold — so you built your own floor out of vigilance. You can survive almost anything, but resting feels like a risk.',
    balanced: 'The root reads steady. You know how to stand on your own feet, and you carry a quiet "I will be okay" that other people can feel and lean on.',
    high: 'The root is gripping. Security has become the whole project — routines, control, holding on. What once kept you safe is starting to keep you still.'
  },
  {
    key: 'sacral', trait: 'flow', name: 'Sacral', sanskrit: 'Svadhisthana', color: '#e67e22',
    domain: 'desire, pleasure, creativity, emotional flow',
    low: 'The sacral center is dammed. Desire got filed under "unsafe" or "unnecessary" somewhere along the way, and creativity comes out in short bursts before you shut the tap again.',
    balanced: 'The sacral center moves. You can want things without shame and feel things without drowning in them — that is rarer than people think.',
    high: 'The sacral center is flooding. Feeling everything, chasing the next sensation, the next person, the next high — the river has no banks right now.'
  },
  {
    key: 'solar', trait: 'fire', name: 'Solar Plexus', sanskrit: 'Manipura', color: '#f1c40f',
    domain: 'will, power, identity, self-direction',
    low: 'The solar fire is banked low. You defer, you accommodate, you let the room decide. The will is there — it is just waiting for permission it does not need.',
    balanced: 'The solar fire burns clean. You can say "this is what I am doing" without needing to win or needing to hide.',
    high: 'The solar fire is running hot. Control, proving, pushing. The will is strong enough that it can steamroll the quieter parts of you that are trying to speak.'
  },
  {
    key: 'heart', trait: 'heart', name: 'Heart', sanskrit: 'Anahata', color: '#27ae60',
    domain: 'love, compassion, grief, the bridge between lower and upper',
    low: 'The heart is shuttered. Not empty — shuttered. Something taught you that openness gets punished, so love comes out as loyalty and usefulness instead of softness.',
    balanced: 'The heart is the bridge it is meant to be. You can give and receive, and you do not keep score.',
    high: 'The heart is wide open with no door. You love hard and feel everyone\'s weather as your own. The gift is real; the cost is that you forget where you end.'
  },
  {
    key: 'throat', trait: 'voice', name: 'Throat', sanskrit: 'Vishuddha', color: '#2e86de',
    domain: 'expression, truth, being heard',
    low: 'The throat is tight. There are sentences you have rehearsed a hundred times and never said. You edit yourself before anyone else gets the chance to.',
    balanced: 'The throat is clear. You say what is true in a way people can actually receive.',
    high: 'The throat is overflowing — talking to fill space, performing, explaining. Sometimes the words are armor too.'
  },
  {
    key: 'thirdeye', trait: 'vision', name: 'Third Eye', sanskrit: 'Ajna', color: '#5b3cc4',
    domain: 'intuition, perception, insight, seeing beneath the surface',
    low: 'The third eye is dim — not absent, but overruled. You notice things, then argue yourself out of what you noticed.',
    balanced: 'The third eye is open and trusted. You read rooms, read people, and you are usually right.',
    high: 'The third eye is wide and restless. You see too much — patterns, subtext, what people are not saying — and it is hard to turn off.'
  },
  {
    key: 'crown', trait: 'source', name: 'Crown', sanskrit: 'Sahasrara', color: '#9b59b6',
    domain: 'meaning, spirit, connection to source',
    low: 'The crown is quiet. Life has been about getting through, not about why. The bigger question is waiting for you whenever you are ready to ask it.',
    balanced: 'The crown is connected. You have a thread to something larger than your own story, and it steadies you.',
    high: 'The crown is pulling you upward and away. Meaning, mysticism, the unseen — it can become a place to live instead of a place to visit. The body wants you back.'
  }
];

// Archetypes blend Jung's twelve with the figures the readings kept returning to
// (Hermes, the Wounded Healer, the Sentinel). Each has a trait signature.
export const ARCHETYPES = [
  {
    key: 'hermes', name: 'The Messenger', mythic: 'Hermes',
    signature: { voice: 1, vision: 0.8, flow: 0.6, open: 0.5 },
    essence: 'You are a translator between worlds that do not normally speak to each other.',
    gift: 'You carry messages across boundaries — between people, between scenes, between the seen and the unseen. You make strangers understand each other.',
    danger: 'You serve the function so well that you forget to have a destination of your own. You connect everyone to their path, and the question "what is my path, independent of being useful?" is the one you avoid sitting with.',
    trueWill: 'Your True Will is not any single thing you do. It is the bridge function itself — to translate, to connect, to carry truth from one realm into another in a form people can receive.',
    shadow: 'The Trickster: saying what each room wants to hear until nobody, including you, knows what you actually think.'
  },
  {
    key: 'healer', name: 'The Wounded Healer', mythic: 'Chiron',
    signature: { heart: 1, absorb: 0.9, vision: 0.6, open: 0.4 },
    essence: 'You are meant to hold space for other people\'s darkness because you are intimate with your own.',
    gift: 'People fall apart near you because it is safe to. You "just know" when something is wrong. You make people feel less alone in their pain.',
    danger: 'The gift is running in reverse. Instead of consciously channeling it, you are unconsciously absorbing everyone around you — and you have not yet learned to tell your emotions apart from theirs. Until you do, the gift eats you alive.',
    trueWill: 'Your True Will is to be a healer — not in the way people usually mean that word. Not a clinician. Someone who sits with people in their pain and walks them back to themselves.',
    shadow: 'The Martyr: giving until empty, then quietly resenting the people you gave to.'
  },
  {
    key: 'sentinel', name: 'The Sentinel', mythic: 'Heimdall',
    signature: { armor: 1, ground: 0.8, fire: 0.6, vision: 0.4 },
    essence: 'You are the watcher at the gate — the one who stays alert so everyone else can sleep.',
    gift: 'You are unshakeable under pressure. You notice threats early, you keep your word, and people feel protected near you even if they cannot say why.',
    danger: 'The watch never ends. The citadel you built to survive has become the place you live, and nobody — including you — gets all the way in.',
    trueWill: 'Your True Will is guardianship: protecting what is sacred, including, eventually, your own softness.',
    shadow: 'The Tyrant of One: controlling your own inner life so tightly that nothing new can grow.'
  },
  {
    key: 'sovereign', name: 'The Sovereign', mythic: 'Jupiter',
    signature: { fire: 1, ground: 0.8, voice: 0.6 },
    essence: 'You are here to build order where there was chaos and to take responsibility others will not.',
    gift: 'You can hold a vision and a plan at the same time. People instinctively look to you when a decision has to be made.',
    danger: 'You confuse carrying everything with being worthy. The crown gets heavy when you refuse to set it down.',
    trueWill: 'Your True Will is stewardship — to rule your own life so completely that you make room for others to rule theirs.',
    shadow: 'The Tyrant: power used to avoid feeling powerless.'
  },
  {
    key: 'mystic', name: 'The Mystic', mythic: 'The Hermit',
    signature: { source: 1, vision: 0.9, open: 0.4 },
    essence: 'You are tuned to a frequency most people cannot hear.',
    gift: 'You perceive the pattern behind events. Synchronicities find you. You can go inward and come back with something true.',
    danger: 'The unseen becomes a hiding place from the seen. Transcendence is easier than being a body with bills and needs and people who disappoint you.',
    trueWill: 'Your True Will is to bring what you receive down to earth — not to escape into the light but to anchor it here.',
    shadow: 'The Spiritual Bypasser: using the sacred to avoid the ordinary pain that would actually heal you.'
  },
  {
    key: 'lover', name: 'The Lover', mythic: 'Aphrodite / Eros',
    signature: { heart: 0.9, flow: 1, open: 0.7 },
    essence: 'You are here to experience life fully and to remind people it is meant to be felt.',
    gift: 'You bring warmth, beauty, and aliveness into any room. People feel seen and wanted around you.',
    danger: 'You can lose yourself in the other — in the connection, the intensity, the feeling of being needed.',
    trueWill: 'Your True Will is devotion: to love something (a person, a craft, life itself) so completely that it transforms you.',
    shadow: 'The Addict: chasing the feeling instead of the person.'
  },
  {
    key: 'creator', name: 'The Creator', mythic: 'Hephaestus',
    signature: { flow: 0.9, voice: 0.8, fire: 0.5, vision: 0.5 },
    essence: 'You are here to make things that did not exist before you.',
    gift: 'You turn feeling into form. Pain, beauty, ideas — they come through your hands as something others can hold.',
    danger: 'Your worth gets fused with your output. When you are not making, you feel like you are not real.',
    trueWill: 'Your True Will is expression — to let what is inside become visible without first needing permission or perfection.',
    shadow: 'The Perfectionist: never finishing because finishing means being judged.'
  },
  {
    key: 'rebel', name: 'The Rebel', mythic: 'Prometheus',
    signature: { fire: 0.9, armor: 0.5, voice: 0.7, open: 0.3 },
    essence: 'You are here to break what is false so something true can grow.',
    gift: 'You see the cage everyone else calls normal, and you are brave enough to say so.',
    danger: 'You define yourself by what you are against. Without an enemy, you do not know who you are.',
    trueWill: 'Your True Will is liberation — first your own, then others\'. The fire you stole is meant to be shared, not just thrown.',
    shadow: 'The Destroyer: tearing down even what was good because it felt like a rule.'
  },
  {
    key: 'sage', name: 'The Sage', mythic: 'Athena',
    signature: { vision: 0.9, ground: 0.6, armor: 0.4, source: 0.5 },
    essence: 'You are here to understand — and to help others see clearly.',
    gift: 'You stay calm when others panic. You think in systems and you can explain what others only sense.',
    danger: 'You live in your head because feelings are harder to control than ideas. Understanding becomes a substitute for experiencing.',
    trueWill: 'Your True Will is wisdom embodied — not knowing about life, but knowing life.',
    shadow: 'The Cold Observer: watching life instead of entering it.'
  },
  {
    key: 'explorer', name: 'The Explorer', mythic: 'Odysseus',
    signature: { open: 0.9, flow: 0.6, fire: 0.6, ground: 0.2 },
    essence: 'You are here to go where you have not been — outwardly and inwardly.',
    gift: 'Restless curiosity. You adapt fast, you are not afraid of the unknown, and you bring back stories that change people.',
    danger: 'Moving becomes a way of never arriving. You leave before anything can ask you to stay.',
    trueWill: 'Your True Will is the journey that ends in homecoming — finding the place (or person, or practice) worth staying for.',
    shadow: 'The Wanderer: always searching so you never have to be found.'
  },
  {
    key: 'caregiver', name: 'The Caregiver', mythic: 'Demeter',
    signature: { heart: 0.9, ground: 0.7, absorb: 0.6, armor: 0.2 },
    essence: 'You are here to nourish and to protect what is growing.',
    gift: 'You make people feel fed — emotionally, practically, spiritually. Your presence is a home.',
    danger: 'You give what you most need, hoping someone will notice and give it back. They rarely do, because you make it look effortless.',
    trueWill: 'Your True Will is nurture — including learning to be one of the people you take care of.',
    shadow: 'The Smotherer: care that quietly becomes control.'
  },
  {
    key: 'jester', name: 'The Jester', mythic: 'Dionysus / the Fool',
    signature: { open: 0.9, voice: 0.8, flow: 0.7, armor: 0.3 },
    essence: 'You are here to lighten what is heavy and to tell the truth through laughter.',
    gift: 'You change the energy of a room just by walking in. You can say the unsayable and make it land as a joke.',
    danger: 'The smile can be a mask. You make everyone else feel lighter and carry the weight alone.',
    trueWill: 'Your True Will is joy as medicine — real joy, not the performed kind — and the freedom to be sad in front of people too.',
    shadow: 'The Clown in the Mirror: laughing so nobody asks how you really are.'
  }
];

// Western palmistry hand types (the elemental system).
export const HAND_TYPES = {
  earth: {
    name: 'Earth Hand', shape: 'square palm, shorter fingers',
    reading: 'Earth hands belong to builders. You trust what you can touch. You are loyal, practical, and slow to change — but once you commit, you are a foundation other people stand on.',
    traits: { ground: 0.3, armor: 0.1 }
  },
  air: {
    name: 'Air Hand', shape: 'square palm, long fingers',
    reading: 'Air hands belong to communicators and thinkers. Your mind moves fast and wants to connect ideas and people. The risk is living in your head when your body is asking for attention.',
    traits: { voice: 0.3, vision: 0.15 }
  },
  fire: {
    name: 'Fire Hand', shape: 'long palm, shorter fingers',
    reading: 'Fire hands belong to initiators. You act before you are ready, and that is often your gift. Enthusiasm is contagious around you; patience is your lesson.',
    traits: { fire: 0.3, flow: 0.15 }
  },
  water: {
    name: 'Water Hand', shape: 'long palm, long slender fingers',
    reading: 'Water hands belong to the sensitive and intuitive. You absorb atmosphere like a sponge — creative, empathic, deeply feeling. The lesson of water is boundaries: a river without banks becomes a flood.',
    traits: { heart: 0.2, absorb: 0.25, vision: 0.15 }
  }
};

export const FINGER_NOTES = {
  jupiterLong: { text: 'Your index finger (Jupiter) runs long against the ring finger — a signature of leadership and self-direction. You want to steer your own life.', traits: { fire: 0.15 } },
  apolloLong: { text: 'Your ring finger (Apollo) runs long against the index — the creative, risk-taking, expressive signature. You are drawn to beauty and to being seen through what you make.', traits: { flow: 0.15, voice: 0.05 } },
  mercuryLong: { text: 'Your little finger (Mercury) reaches high — a sign of a persuasive, perceptive communicator. Words and reading people come naturally.', traits: { voice: 0.15, vision: 0.05 } },
  mercuryShort: { text: 'Your little finger (Mercury) sits low — you may find it easier to feel something than to say it out loud.', traits: { voice: -0.1, armor: 0.05 } },
  wideThumb: { text: 'Your thumb opens wide from the hand — independence, generosity, and a willingness to take risks.', traits: { open: 0.15, fire: 0.05 } },
  closeThumb: { text: 'Your thumb stays close to the hand — caution and self-containment. You keep your resources, and yourself, held in.', traits: { armor: 0.15 } },
  spreadFingers: { text: 'You spread your fingers wide when you show your palm — an open-handed, "here I am" gesture. You tend to reveal rather than conceal.', traits: { open: 0.15 } },
  closedFingers: { text: 'You held your fingers close together — a careful, contained gesture. You share, but on your terms.', traits: { armor: 0.1 } }
};

// Palm line self-reports (users pick from illustrations).
export const PALM_LINES = {
  heart: {
    question: 'Where does your heart line end? (The top line across your palm, starting under the little finger.)',
    options: [
      { value: 'jupiter', label: 'Under the index finger', text: 'Your heart line reaches toward Jupiter — the idealist in love. You love with your whole value system and are shaken when people do not live up to it.', traits: { heart: 0.15, source: 0.05 } },
      { value: 'between', label: 'Between index and middle', text: 'Your heart line ends between Jupiter and Saturn — the balanced heart. You can give fully without losing your footing.', traits: { heart: 0.1, ground: 0.05 } },
      { value: 'saturn', label: 'Under the middle finger', text: 'Your heart line stops under Saturn — love is guarded and self-protective. You give care, but you ration vulnerability.', traits: { armor: 0.15 } },
      { value: 'long', label: 'Runs all the way across', text: 'Your heart line runs clean across the palm — you feel with enormous range, and other people\'s feelings arrive in you almost unfiltered.', traits: { heart: 0.1, absorb: 0.15 } }
    ]
  },
  head: {
    question: 'How does your head line travel? (The middle line, starting near the thumb.)',
    options: [
      { value: 'straight', label: 'Straight across', text: 'A straight head line — practical, logical, clear. You solve things.', traits: { ground: 0.1, fire: 0.05 } },
      { value: 'sloping', label: 'Curves down toward the wrist', text: 'A sloping head line — the imaginative, intuitive mind. You think in images and feelings, not lists.', traits: { vision: 0.15, flow: 0.05 } },
      { value: 'short', label: 'Short, ends early', text: 'A short head line — you trust instinct over analysis and act on what you know in your gut.', traits: { fire: 0.1 } },
      { value: 'joined', label: 'Starts joined to the life line', text: 'Your head line begins tied to the life line — early caution. You learned to think before you leap, maybe because leaping was not safe.', traits: { armor: 0.1, ground: 0.05 } }
    ]
  },
  life: {
    question: 'How wide does your life line curve around your thumb?',
    options: [
      { value: 'wide', label: 'Wide arc into the palm', text: 'A wide life line — big vitality, big appetite for experience.', traits: { flow: 0.1, open: 0.1 } },
      { value: 'close', label: 'Hugs the thumb closely', text: 'A life line that hugs the thumb — energy you conserve and protect. You pace yourself because you learned you had to.', traits: { armor: 0.1, ground: 0.05 } },
      { value: 'broken', label: 'Broken or has a gap', text: 'A break in the life line — a before and after. Something reset the course of your life and you rebuilt from there.', traits: { ground: -0.05, source: 0.1 } },
      { value: 'unsure', label: 'Not sure', text: '', traits: {} }
    ]
  }
};

// Foot reading (toe-shape typology used by foot readers and reflexologists).
export const FOOT_TYPES = {
  question: 'Which foot shape looks most like yours?',
  options: [
    { value: 'egyptian', label: 'Egyptian — big toe longest, the rest step down', text: 'The Egyptian foot — the dreamer. Imaginative, private, emotionally deep. You have a rich inner world and you do not show all of it.', traits: { vision: 0.1, armor: 0.05, flow: 0.05 } },
    { value: 'greek', label: 'Greek — second toe longer than the big toe', text: 'The Greek foot — the fire-starter. Creative, enthusiastic, a natural motivator who leads with inspiration. Can burn through energy faster than you replenish it.', traits: { fire: 0.1, voice: 0.1 } },
    { value: 'roman', label: 'Roman — first three toes about equal', text: 'The Roman foot — the balanced traveler. Social, curious, drawn to explore. You stand firmly in the world and like to see a lot of it.', traits: { open: 0.1, ground: 0.05 } },
    { value: 'square', label: 'Square — all toes nearly the same length', text: 'The square foot — the steady one. Methodical, fair, reliable. You weigh everything before you move, and when you move you do not stop.', traits: { ground: 0.15 } },
    { value: 'celtic', label: 'Celtic — big toe long, 2nd toe long, then a sharp drop', text: 'The Celtic foot — the passionate independent. Quick energy, strong opinions, a streak of rebellion.', traits: { fire: 0.1, open: 0.05 } }
  ],
  // Reflexology zone folklore for self-reported tension spots.
  zones: {
    toes: 'the head and thoughts — an overactive mind',
    ball: 'the chest and heart — emotional weight you are carrying',
    arch: 'the digestion and solar plexus — power and "gut" decisions',
    heel: 'the root — safety, family, the ground under you'
  }
};

// Dominant color of the light / space a person chose to be photographed in.
export const COLOR_RESONANCE = [
  { maxHue: 15, chakra: 'root', text: 'You were photographed in red light — the color of the root. Something in you is calling for safety, grounding, and the right to simply exist.' },
  { maxHue: 40, chakra: 'sacral', text: 'You were photographed in orange light — the sacral color of desire, creativity and feeling. You surround yourself with warmth.' },
  { maxHue: 70, chakra: 'solar', text: 'Your photos glow gold — the solar plexus color. You are drawn to light that feels like confidence and clarity.' },
  { maxHue: 165, chakra: 'heart', text: 'Green runs through your photos — the heart color. You orient toward growth, nature, and healing.' },
  { maxHue: 225, chakra: 'throat', text: 'Blue dominates your photos — the throat color. You seek calm and clear communication, maybe because the world around you has not always given it.' },
  { maxHue: 262, chakra: 'thirdeye', text: 'You chose indigo light — the third-eye color. The space you live in looks like the inside of an intuition: night-colored, perceptive, a little otherworldly.' },
  { maxHue: 330, chakra: 'crown', text: 'You chose to be seen in violet light — the crown color. People do not accidentally bathe their rooms in purple; the part of you that seeks meaning built itself a temple.' },
  { maxHue: 361, chakra: 'root', text: 'You were photographed in deep red-magenta light — root and crown at once. Body and spirit, both asking to be honored.' }
];

// Messages from the superconscious, keyed by the pattern they answer.
export const SUPERCONSCIOUS = {
  rest: 'You\'ve earned the right to rest. The armor was necessary. The self-built root was necessary. The watch was necessary. But the season is shifting — the next phase is not about building more, it is about letting what you have already built hold you.',
  boundaries: 'Not everything you feel is yours. Before you carry the next person\'s weight, ask: "Is this mine?" The gift does not get smaller when you give it a door — it gets stronger.',
  speak: 'The sentence you keep rehearsing is ready to be said. Your voice was never too much. The silence has been costing you more than the truth ever would.',
  soften: 'Strength is not the same as hardness. The next level of power for you is receptivity — letting someone see you mid-process, unfinished, unsure.',
  descend: 'Come back into your body. The insights are real, but they are meant to be lived, not just seen. Walk, eat, touch the ground. Spirit wants to use your hands.',
  direction: 'Choose a destination that is yours. You have been an excellent vehicle for everyone else\'s journey. What would you move toward if nobody needed anything from you?',
  play: 'Joy is not a reward for finishing. Let yourself enjoy something today without earning it.',
  stay: 'The thing you are searching for is asking you to stay still long enough to find you.',
  center: 'Neither the armor nor the wide-open wound is your center. Your center is choice — the ability to open and close consciously, the way a hand opens and closes.'
};

export const REFLECTIONS = {
  ground: 'Where in your life do you feel held, not just in control?',
  flow: 'What do you want that you have not let yourself want out loud?',
  fire: 'Whose permission are you still waiting for?',
  heart: 'Who takes care of you — and do you let them?',
  voice: 'What is the truest sentence you have not said yet?',
  vision: 'What do you already know that you keep pretending you do not?',
  source: 'What would your life look like if you trusted that it means something?',
  armor: 'What would happen if you let one person all the way in?',
  absorb: 'How do you know when a feeling is yours and not someone else\'s?',
  open: 'Where are you open by choice, and where are you open because you do not know how to close?'
};
