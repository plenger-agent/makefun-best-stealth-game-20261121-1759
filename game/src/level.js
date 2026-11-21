// Night Archive — the three levels.
// A level is plain data: walls and shelves are rectangles the player and
// the guards cannot cross and that block a guard's line of sight; shadow
// pools are places to hide; guards walk their waypoint loops; documents
// are optional pickups; the exit door ends the level unseen.

import { PLAY_LEFT, PLAY_RIGHT, PLAY_TOP, PLAY_BOTTOM } from './config.js';

// Helper so a level reads like a floor plan: x, y, width, height.
const rect = (x, y, w, h) => ({ x, y, w, h });
const point = (x, y) => ({ x, y });

export const LEVELS = [
  {
    name: 'Level 1 — The Reading Room',
    subtitle: 'Learn the patrols. Reach the green door unseen.',
    playerSpawn: point(70, 640),
    exit: rect(1200, 90, 56, 84),
    walls: [
      rect(PLAY_LEFT, PLAY_TOP, PLAY_RIGHT - PLAY_LEFT, 6),
      rect(PLAY_LEFT, PLAY_BOTTOM - 6, PLAY_RIGHT - PLAY_LEFT, 6),
      rect(PLAY_LEFT, PLAY_TOP, 6, PLAY_BOTTOM - PLAY_TOP),
      rect(PLAY_RIGHT - 6, PLAY_TOP, 6, PLAY_BOTTOM - PLAY_TOP),
      // A reading-room divider that splits the room in two.
      rect(560, 120, 18, 300),
      rect(900, 420, 18, 240),
    ],
    shelves: [
      rect(180, 150, 240, 34),
      rect(180, 300, 240, 34),
      rect(180, 450, 240, 34),
      rect(700, 150, 220, 34),
      rect(700, 300, 220, 34),
      rect(1020, 450, 200, 34),
      rect(1020, 580, 200, 34),
    ],
    shadows: [
      rect(450, 140, 130, 120),
      rect(450, 470, 130, 120),
      rect(950, 170, 120, 110),
      rect(90, 330, 90, 110),
    ],
    moonPools: [
      { x: 640, y: 560, r: 130 },
      { x: 1120, y: 250, r: 110 },
    ],
    documents: [point(300, 200), point(810, 340)],
    guards: [
      {
        name: 'Warden Bram',
        waypoints: [point(500, 200), point(500, 620), point(860, 620), point(860, 200)],
        speed: 62,
        viewDistance: 225,
        pause: 1.4,
      },
      {
        name: 'Warden Sela',
        waypoints: [point(1080, 140), point(1080, 560), point(640, 560)],
        speed: 58,
        viewDistance: 220,
        pause: 1.8,
      },
    ],
  },
  {
    name: 'Level 2 — The Stacks',
    subtitle: 'Three wardens now. The tall shelves hide you — and them.',
    playerSpawn: point(70, 640),
    exit: rect(1200, 90, 56, 84),
    walls: [
      rect(PLAY_LEFT, PLAY_TOP, PLAY_RIGHT - PLAY_LEFT, 6),
      rect(PLAY_LEFT, PLAY_BOTTOM - 6, PLAY_RIGHT - PLAY_LEFT, 6),
      rect(PLAY_LEFT, PLAY_TOP, 6, PLAY_BOTTOM - PLAY_TOP),
      rect(PLAY_RIGHT - 6, PLAY_TOP, 6, PLAY_BOTTOM - PLAY_TOP),
      rect(420, 120, 18, 260),
      rect(420, 470, 18, 190),
      rect(840, 120, 18, 190),
      rect(840, 400, 18, 260),
    ],
    shelves: [
      rect(150, 150, 200, 34),
      rect(150, 330, 200, 34),
      rect(150, 510, 200, 34),
      rect(520, 180, 220, 34),
      rect(520, 380, 220, 34),
      rect(520, 560, 220, 34),
      rect(940, 180, 220, 34),
      rect(940, 380, 220, 34),
      rect(940, 560, 220, 34),
    ],
    shadows: [
      rect(360, 250, 110, 100),
      rect(760, 250, 110, 100),
      rect(360, 540, 110, 100),
      rect(1120, 300, 110, 110),
      rect(80, 200, 90, 100),
    ],
    moonPools: [
      { x: 640, y: 300, r: 120 },
      { x: 1120, y: 620, r: 110 },
      { x: 240, y: 640, r: 100 },
    ],
    documents: [point(250, 200), point(630, 430), point(1050, 430)],
    guards: [
      {
        name: 'Warden Bram',
        waypoints: [point(400, 160), point(400, 640), point(800, 640), point(800, 160)],
        speed: 74,
        viewDistance: 235,
        pause: 1.1,
      },
      {
        name: 'Warden Sela',
        waypoints: [point(1180, 130), point(1180, 640), point(900, 640)],
        speed: 70,
        viewDistance: 230,
        pause: 1.4,
      },
      {
        name: 'Warden Odo',
        waypoints: [point(90, 120), point(90, 400), point(360, 400), point(360, 120)],
        speed: 66,
        viewDistance: 225,
        pause: 1.6,
      },
    ],
  },
  {
    name: 'Level 3 — The Vault Wing',
    subtitle: 'Four wardens, fast patrols, long sight lines. Ghost it.',
    playerSpawn: point(70, 640),
    exit: rect(1200, 90, 56, 84),
    walls: [
      rect(PLAY_LEFT, PLAY_TOP, PLAY_RIGHT - PLAY_LEFT, 6),
      rect(PLAY_LEFT, PLAY_BOTTOM - 6, PLAY_RIGHT - PLAY_LEFT, 6),
      rect(PLAY_LEFT, PLAY_TOP, 6, PLAY_BOTTOM - PLAY_TOP),
      rect(PLAY_RIGHT - 6, PLAY_TOP, 6, PLAY_BOTTOM - PLAY_TOP),
      rect(330, 120, 18, 300),
      rect(330, 500, 18, 160),
      rect(660, 120, 18, 160),
      rect(660, 360, 18, 300),
      rect(990, 120, 18, 300),
      rect(990, 500, 18, 160),
    ],
    shelves: [
      rect(130, 170, 160, 34),
      rect(130, 360, 160, 34),
      rect(130, 550, 160, 34),
      rect(430, 170, 180, 34),
      rect(430, 360, 180, 34),
      rect(430, 550, 180, 34),
      rect(760, 170, 180, 34),
      rect(760, 360, 180, 34),
      rect(760, 550, 180, 34),
      rect(1080, 360, 140, 34),
      rect(1080, 550, 140, 34),
    ],
    shadows: [
      rect(290, 250, 90, 90),
      rect(620, 250, 90, 90),
      rect(950, 250, 90, 90),
      rect(290, 560, 90, 90),
      rect(1080, 180, 100, 100),
    ],
    moonPools: [
      { x: 500, y: 300, r: 110 },
      { x: 830, y: 620, r: 110 },
      { x: 1150, y: 480, r: 100 },
    ],
    documents: [point(210, 220), point(520, 410), point(850, 220)],
    guards: [
      {
        name: 'Warden Bram',
        waypoints: [point(300, 140), point(300, 640), point(620, 640), point(620, 140)],
        speed: 88,
        viewDistance: 250,
        pause: 0.8,
      },
      {
        name: 'Warden Sela',
        waypoints: [point(960, 140), point(960, 640), point(700, 640), point(700, 140)],
        speed: 84,
        viewDistance: 245,
        pause: 0.9,
      },
      {
        name: 'Warden Odo',
        waypoints: [point(90, 120), point(90, 640), point(280, 640)],
        speed: 80,
        viewDistance: 240,
        pause: 1.0,
      },
      {
        name: 'Warden Mir',
        waypoints: [point(1230, 200), point(1230, 640), point(1030, 640), point(1030, 200)],
        speed: 82,
        viewDistance: 245,
        pause: 1.0,
      },
    ],
  },
];

// Every rectangle that blocks movement and sight: walls plus shelves.
export function blockersOf(level) {
  return [...level.walls, ...level.shelves];
}

// True when the point lies inside any shadow pool of the level.
export function inShadow(level, x, y) {
  return level.shadows.some((s) => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h);
}
