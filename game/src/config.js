// Night Archive — tuning constants for the whole game.
// One place holds every number a designer would tweak: canvas size,
// movement speeds, guard senses, suspicion rates and colours.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const HUD_HEIGHT = 56;
export const PLAY_TOP = HUD_HEIGHT + 4;
export const PLAY_BOTTOM = CANVAS_HEIGHT - 8;
export const PLAY_LEFT = 8;
export const PLAY_RIGHT = CANVAS_WIDTH - 8;

export const PLAYER_RADIUS = 13;
export const GUARD_RADIUS = 14;

// Player movement (pixels per second) and how far each gait is heard.
export const MOVE_SPEED = {
  crouch: 62,
  walk: 128,
  run: 205,
};
export const NOISE_RADIUS = {
  crouch: 0,
  walk: 46,
  run: 118,
};

// Guard senses.
export const GUARD_VIEW_DISTANCE = 235;
export const GUARD_VIEW_HALF_ANGLE = 0.56; // radians, about 32 degrees each side
export const GUARD_HEAR_DISTANCE = 150;

// Suspicion 0..100. How fast it grows while the guard has eyes on you,
// scaled by distance, your stance and whether you stand in shadow.
export const SUSPICION_BUILD_BASE = 46;
export const SUSPICION_BUILD_CLOSE = 95; // extra when you are very near
export const SUSPICION_DECAY = 14;
export const SUSPICION_WARY = 55; // "?" — guard turns suspicious
export const SUSPICION_ALARM = 100; // "!" — full alarm
export const ALARM_DURATION = 5.0; // seconds the alarm chases you
export const SEARCH_DURATION = 4.0; // seconds guards search the last seen spot
export const CATCH_DISTANCE = 20; // guard this close while alarmed catches you

// A guard that loses you for this long gives up and goes back to patrol.
export const LOSE_SIGHT_GRACE = 1.2;

// Shadow hiding: detection is multiplied by this while you stand in shadow,
// and a guard must be very close to spot you at all inside one.
export const SHADOW_DETECTION_MULT = 0.12;
export const SHADOW_SPOT_DISTANCE = 64;

// Crouching makes you harder to see; running makes you easier.
export const STANCE_DETECTION_MULT = { crouch: 0.55, walk: 1.0, run: 1.35 };

// Colours.
export const COLORS = {
  floor: '#241d16',
  floorAlt: '#2a211a',
  wall: '#17120d',
  wallEdge: '#4a3b28',
  shelf: '#5a3d22',
  shelfTop: '#7a5632',
  bookSpine: ['#8a2f2f', '#2f5a8a', '#3f7a3a', '#8a6a2f', '#6a3f8a', '#a8542f'],
  shadowPool: 'rgba(8, 10, 26, 0.55)',
  moonPool: 'rgba(190, 205, 235, 0.10)',
  exitDoor: '#3fae6a',
  exitGlow: 'rgba(63, 174, 106, 0.35)',
  doc: '#f2ead8',
  player: '#2ec4b6',
  playerCloak: '#1d7a70',
  guard: '#c94f4f',
  guardDark: '#7a2a2a',
  coneCalm: 'rgba(250, 204, 21, 0.30)',
  coneWary: 'rgba(249, 115, 22, 0.42)',
  coneAlarm: 'rgba(239, 68, 68, 0.50)',
  hudBg: '#120e0a',
  hudText: '#f0e6d2',
  hudDim: '#9a8f7a',
  alertGreen: '#4ade80',
  alertAmber: '#fbbf24',
  alertRed: '#f87171',
};
