# Subconscious Dig

A private web app that reads the cues you give off without meaning to (expression, gaze, hands, feet, posture, even the light you live in). It then asks a few optional questions and gives you a full breakdown through:

- **Chakras:** a seven-center energy map showing what's underactive, balanced or overactive.
- **Jungian psychology:** your dominant and secondary archetypes, the persona and the shadow.
- **Thelema:** the shape of your True Will, and the danger that comes with your gift.
- **Body reading:** face reading, palmistry (elemental hand types, finger lengths, palm lines), foot reading and posture (Reichian "armor").
- **The superconscious message:** what's trying to come through right now.

**No AI API and no server.** Photos are measured in the browser with Google's open-source [MediaPipe](https://developers.google.com/mediapipe) models, which are vendored in `vendor/`. They never leave the device. The reading is assembled from a hand-written interpretation library.

> For reflection and self-exploration, not a diagnosis or a prediction.

## How it works

1. **Photos** (`js/vision.js`). MediaPipe's face, hand and pose landmarkers measure things like smile intensity, whether the smile reaches the eyes, lip pressure, brow position, gaze, head tilt, palm and finger proportions, thumb spread, shoulder level, crossed arms and stance. A canvas pass measures the dominant color of the light.
2. **Interpretation** (`js/engine.js`). Each measurement adjusts ten traits: `ground, flow, fire, heart, voice, vision, source, armor, absorb, open`. The first seven map to the chakras.
3. **Questions** (`js/questions.js`). The engine picks the optional questions that best settle whatever the photos left uncertain. If you uploaded a palm or foot photo, it adds palm-line and foot-shape pickers. It always ends with "If nobody needed anything from you for a year, what would you do?", and your answer is quoted back in the True Will section.
4. **Reading** (`js/knowledge.js`). Archetypes, chakra states, hand and foot types, color resonance and superconscious messages are all written here. **To change the voice or add material, edit this file.**

## Run it locally

ES modules need a local server; opening the file directly won't work.

```bash
npm start          # serves on http://localhost:8080
npm test           # engine tests (Node 18+)
```

## Deploy

It's a static site, so any static host works. The easiest is **GitHub Pages**: Settings → Pages → deploy from the `main` branch, `/ (root)`.

## Tuning

The thresholds that turn measurements into observations live in `js/engine.js` (`interpretFace`, `classifyHand`, `interpretHand`, `interpretPose`). They were calibrated against sample photos. Adjust them if readings for your photos feel off.
