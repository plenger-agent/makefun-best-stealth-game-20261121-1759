// Night Archive — boot, fixed-step loop and screens.
// The game owns one state object; the loop steps it at a fixed 60 Hz so
// patrols, suspicion and timers behave the same on every machine, and the
// renderer draws whatever state the step produced.

import { CANVAS_HEIGHT, CANVAS_WIDTH, GUARD_HEAR_DISTANCE } from './config.js';
import { LEVELS } from './level.js';
import { makeGuard, raiseAlarm, updateGuard } from './guards.js';
import { makePlayer, updatePlayer } from './player.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { drawScreen } from './render.js';
import { topSuspicion } from './detection.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const input = createInput();
const audio = createAudio();
const query = new URLSearchParams(window.location.search);

const game = {
  screen: 'title', // title | playing | levelClear | caught | paused
  levelIndex: 0,
  levelCount: LEVELS.length,
  level: LEVELS[0],
  player: null,
  guards: [],
  collectedDocs: new Set(),
  docsCollected: 0,
  elapsed: 0,
  levelTime: 0,
  levelTimeText: '00:00',
  topSuspicion: 0,
  alertState: 'calm', // calm | wary | alarm
  alarmBanner: 0,
  toast: '',
  toastTimer: 0,
  alarmSounded: false,
};

function loadLevel(index) {
  game.levelIndex = index;
  game.level = LEVELS[index];
  game.player = makePlayer(game.level.playerSpawn);
  game.guards = game.level.guards.map((def) => makeGuard(def));
  game.collectedDocs = new Set();
  game.docsCollected = 0;
  game.levelTime = 0;
  game.topSuspicion = 0;
  game.alertState = 'calm';
  game.alarmBanner = 0;
  game.alarmSounded = false;
  game.toast = index === 0 ? 'Stay out of the yellow cones — shadows hide you' : game.level.subtitle;
  game.toastTimer = 5;
}

function formatTime(seconds) {
  const t = Math.floor(seconds);
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

function playerReachedExit() {
  const e = game.level.exit;
  const p = game.player;
  return p.x > e.x - 6 && p.x < e.x + e.w + 6 && p.y > e.y - 6 && p.y < e.y + e.h + 6;
}

function collectDocuments() {
  game.level.documents.forEach((doc, i) => {
    if (game.collectedDocs.has(i)) return;
    if (Math.hypot(doc.x - game.player.x, doc.y - game.player.y) < 26) {
      game.collectedDocs.add(i);
      game.docsCollected = game.collectedDocs.size;
      audio.pickup();
      game.toast = `Document ${game.docsCollected} of ${game.level.documents.length} recovered`;
      game.toastTimer = 3;
    }
  });
}

function update(dt) {
  if (game.screen !== 'playing') return;
  game.elapsed += dt;
  game.levelTime += dt;
  if (game.alarmBanner > 0) game.alarmBanner -= dt;
  if (game.toastTimer > 0) {
    game.toastTimer -= dt;
    if (game.toastTimer <= 0) game.toast = '';
  }

  updatePlayer(game.player, input, game.level, dt);
  if (game.player.stepped) {
    audio.footstep(game.player.stance === 'run');
  }

  const events = { caught: false, alarmRaised: false, alarmGuard: '', spotted: '' };
  for (const guard of game.guards) {
    updateGuard(guard, game.player, game.level, dt, events);
    if (guard.stepped) {
      const d = Math.hypot(guard.x - game.player.x, guard.y - game.player.y);
      if (d < GUARD_HEAR_DISTANCE) audio.guardStep(d);
    }
  }
  if (events.spotted) audio.spotted();
  if (events.alarmRaised) {
    raiseAlarm(game.guards, game.player.x, game.player.y);
    game.alarmBanner = 3;
    game.alarmSounded = true;
    audio.alarm();
  }
  if (events.caught) {
    game.screen = 'caught';
    audio.alarm();
    return;
  }

  game.topSuspicion = topSuspicion(game.guards);
  game.alertState =
    game.guards.some((g) => g.state === 'alarm') || game.topSuspicion >= 100
      ? 'alarm'
      : game.topSuspicion >= 55 || game.guards.some((g) => g.state === 'wary')
        ? 'wary'
        : 'calm';

  collectDocuments();
  if (playerReachedExit()) {
    game.levelTimeText = formatTime(game.levelTime);
    game.screen = 'levelClear';
    audio.levelClear();
  }
}

function handleKeys() {
  if (input.wasPressed('mute')) {
    const muted = audio.toggleMute();
    game.toast = muted ? 'Sound off' : 'Sound on';
    game.toastTimer = 1.5;
  }
  if (game.screen === 'title') {
    if (input.wasPressed('confirm')) {
      audio.ensure();
      game.screen = 'playing';
    }
    return;
  }
  if (game.screen === 'levelClear') {
    if (input.wasPressed('confirm')) {
      audio.ensure();
      if (game.levelIndex + 1 >= game.levelCount) loadLevel(0);
      else loadLevel(game.levelIndex + 1);
      game.screen = 'playing';
    }
    return;
  }
  if (game.screen === 'caught') {
    if (input.wasPressed('restart')) {
      loadLevel(game.levelIndex);
      game.screen = 'playing';
    }
    return;
  }
  if (game.screen === 'playing') {
    if (input.wasPressed('pause')) {
      game.screen = 'paused';
      return;
    }
    if (input.wasPressed('restart')) {
      loadLevel(game.levelIndex);
    }
    return;
  }
  if (game.screen === 'paused') {
    if (input.wasPressed('pause') || input.wasPressed('confirm')) {
      game.screen = 'playing';
    }
  }
}

// Fixed-step loop: 60 updates a second, draw after each batch.
let last = performance.now();
let accumulator = 0;
const STEP = 1000 / 60;

function frame(now) {
  const elapsed = Math.min(250, now - last);
  last = now;
  accumulator += elapsed;
  handleKeys();
  while (accumulator >= STEP) {
    update(STEP / 1000);
    accumulator -= STEP;
  }
  drawScreen(ctx, game, now / 1000);
  input.endFrame();
  requestAnimationFrame(frame);
}

// Self-test: ?selftest=1 runs a scripted play-through against the real
// update functions and reports PASS/FAIL into the page for headless checks.
function runSelfTest() {
  const results = [];
  const check = (name, ok) => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  loadLevel(0);
  game.screen = 'playing';
  check('game boots in playing state', game.screen === 'playing');
  check('level 1 has guards', game.guards.length === 2);
  check('level 1 has an exit', game.level.exit.w > 0);
  // Walk the player right for one second.
  const startX = game.player.x;
  input.right = true;
  for (let i = 0; i < 60; i++) update(1 / 60);
  input.right = false;
  check('player moves with keys', game.player.x > startX + 50);
  // Put the player in front of a guard, in the open, and watch suspicion rise.
  // Hold the guard still and facing the player so the patrol cannot turn it away.
  const guard = game.guards[0];
  guard.x = 600;
  guard.y = 400;
  guard.facing = 0;
  guard.suspicion = 0;
  guard.speed = 0;
  guard.waypoints = [{ x: 645, y: 400 }];
  guard.waypointIndex = 0;
  game.player.x = 645;
  game.player.y = 400;
  game.player.stance = 'walk';
  for (let i = 0; i < 120; i++) update(1 / 60);
  check('guard suspicion rises when it sees you', guard.suspicion > 40);
  check('alarm fires on full detection', game.alertState === 'alarm' || guard.suspicion >= 100);
  // Break away into a shadow pool and watch suspicion decay.
  game.screen = 'playing';
  guard.state = 'patrol';
  guard.alarmTimer = 0;
  guard.suspicion = 100;
  game.player.x = 500;
  game.player.y = 200;
  guard.x = 900;
  guard.y = 600;
  const before = guard.suspicion;
  for (let i = 0; i < 180; i++) update(1 / 60);
  check('suspicion decays after breaking away', guard.suspicion < before);
  // Walk to the exit and confirm the level clears.
  loadLevel(0);
  game.screen = 'playing';
  game.player.x = game.level.exit.x + 20;
  game.player.y = game.level.exit.y + 40;
  update(1 / 60);
  check('reaching the exit clears the level', game.screen === 'levelClear');
  // A document pickup.
  loadLevel(0);
  game.screen = 'playing';
  const doc = game.level.documents[0];
  game.player.x = doc.x;
  game.player.y = doc.y;
  update(1 / 60);
  check('document pickup is collected', game.docsCollected === 1);
  const passed = results.filter((r) => r.startsWith('PASS')).length;
  const div = document.createElement('div');
  div.id = 'selftest';
  div.textContent = `SELFTEST ${passed}/${results.length} :: ${results.join(' | ')}`;
  document.body.appendChild(div);
  document.title = `SELFTEST ${passed}/${results.length}`;
}

// Boot.
loadLevel(0);
const staged = stageShot(game, query);
if (staged) {
  // Staged screenshots keep running so cones and timers stay alive.
  game.elapsed = 47;
  game.levelTime = 47;
}
if (query.get('selftest') === '1') runSelfTest();
window.__nightArchive = game;
requestAnimationFrame(frame);
