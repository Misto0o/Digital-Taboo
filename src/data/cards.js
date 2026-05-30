// Each card has a safeWord (the word to guess) and cantSay (forbidden words)
export const cards = [
  {
    id: 1,
    safeWord: 'FIRE ESCAPE',
    cantSay: ['ladder', 'stairs', 'emergency', 'exit', 'building'],
  },
  {
    id: 2,
    safeWord: 'FIRST AID KIT',
    cantSay: ['bandage', 'medicine', 'box', 'hospital', 'wound'],
  },
  {
    id: 3,
    safeWord: 'SMOKE DETECTOR',
    cantSay: ['alarm', 'fire', 'ceiling', 'beep', 'battery'],
  },
  {
    id: 4,
    safeWord: 'HARD HAT',
    cantSay: ['helmet', 'construction', 'head', 'yellow', 'worker'],
  },
  {
    id: 5,
    safeWord: 'SAFETY GOGGLES',
    cantSay: ['eyes', 'glasses', 'protect', 'lab', 'chemistry'],
  },
  {
    id: 6,
    safeWord: 'FIRE EXTINGUISHER',
    cantSay: ['red', 'spray', 'foam', 'flames', 'put out'],
  },
  {
    id: 7,
    safeWord: 'HAZARD SIGN',
    cantSay: ['warning', 'yellow', 'triangle', 'danger', 'symbol'],
  },
  {
    id: 8,
    safeWord: 'LIFE JACKET',
    cantSay: ['float', 'water', 'orange', 'vest', 'boat'],
  },
  {
    id: 9,
    safeWord: 'SAFETY DRILL',
    cantSay: ['practice', 'emergency', 'school', 'exercise', 'alarm'],
  },
  {
    id: 10,
    safeWord: 'CAUTION TAPE',
    cantSay: ['yellow', 'police', 'barrier', 'crime', 'block'],
  },
  {
    id: 11,
    safeWord: 'SEAT BELT',
    cantSay: ['car', 'click', 'buckle', 'drive', 'crash'],
  },
  {
    id: 12,
    safeWord: 'EMERGENCY EXIT',
    cantSay: ['door', 'green', 'sign', 'escape', 'fire'],
  },
  {
    id: 13,
    safeWord: 'CPR',
    cantSay: ['chest', 'heart', 'compress', 'breathe', 'resuscitate'],
  },
  {
    id: 14,
    safeWord: 'SAFETY PIN',
    cantSay: ['sew', 'sharp', 'clasp', 'clothes', 'diaper'],
  },
  {
    id: 15,
    safeWord: 'EVACUATION PLAN',
    cantSay: ['map', 'route', 'escape', 'building', 'emergency'],
  },
];

// Shuffle helper
export function shuffleCards(cardArray) {
  return [...cardArray].sort(() => Math.random() - 0.5);
}
