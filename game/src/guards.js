// Night Archive — guard patrol AI.
// A guard walks a loop of waypoints, pauses at each one and sweeps its
// gaze, then moves on. When it grows suspicious it walks to where it last
// saw you; on full alarm it chases you, and every other guard joins in.
// After the alarm cools down the guards search, then return to patrol.

import {
  ALARM_DURATION,
  CATCH_DISTANCE,
  GUARD_RADIUS,
  LOSE_SIGHT_GRACE,
  SEARCH_DURATION,
  SUSPICION_ALARM,
  SUSPICION_WARY,
} from './config.js';
import { guardSeesPlayer, updateSuspicion } from './detection.js';
import { blockersOf } from './level.js';

export function makeGuard(def) {
  const start = def.waypoints[0];
  return {
    name: def.name,
    x: start.x,
    y: start.y,
    facing: 0,
    speed: def.speed,
    viewDistance: def.viewDistance,
    pause: def.pause,
    waypoints: def.waypoints,
    waypointIndex: 1 % def.waypoints.length,
    pauseTimer: 0,
    sweepPhase: 0,
    suspicion: 0,
    state: 'patrol', // patrol | wary | alarm | search
    lastSeenX: start.x,
    lastSeenY: start.y,
    alarmTimer: 0,
    searchTimer: 0,
    loseSightTimer: 0,
    stepTimer: 0,
    stepped: false,
  };
}

// Slide a circle out of every blocker rectangle it overlaps.
function resolveCollisions(body, level, radius) {
  for (const b of blockersOf(level)) {
    const cx = Math.max(b.x, Math.min(body.x, b.x + b.w));
    const cy = Math.max(b.y, Math.min(body.y, b.y + b.h));
    const dx = body.x - cx;
    const dy = body.y - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < radius) {
      if (dist === 0) {
        body.y = b.y - radius;
      } else {
        body.x = cx + (dx / dist) * radius;
        body.y = cy + (dy / dist) * radius;
      }
    }
  }
}

// Walk toward a point at the guard's speed; true when it arrives.
function walkToward(guard, tx, ty, dt, level) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 4) return true;
  const step = Math.min(dist, guard.speed * dt);
  guard.x += (dx / dist) * step;
  guard.y += (dy / dist) * step;
  guard.facing = Math.atan2(dy, dx);
  resolveCollisions(guard, level, GUARD_RADIUS);
  return dist - step < 4;
}

// A footstep tick the audio layer can hear: true once per stride.
function strideTick(guard, dt) {
  guard.stepTimer -= dt;
  if (guard.stepTimer <= 0) {
    guard.stepTimer = 0.42;
    guard.stepped = true;
    return true;
  }
  guard.stepped = false;
  return false;
}

export function updateGuard(guard, player, level, dt, events) {
  const { seen, strength } = guardSeesPlayer(guard, player, level);
  updateSuspicion(guard, seen, strength, dt, player.x, player.y);
  if (seen) guard.loseSightTimer = 0;
  else guard.loseSightTimer += dt;

  const heardNoise =
    player.noiseRadius > 0 &&
    Math.hypot(player.x - guard.x, player.y - guard.y) < player.noiseRadius;

  if (guard.state === 'alarm') {
    guard.alarmTimer -= dt;
    walkToward(guard, player.x, player.y, dt, level);
    strideTick(guard, dt);
    if (Math.hypot(player.x - guard.x, player.y - guard.y) < CATCH_DISTANCE) {
      events.caught = true;
    }
    if (guard.alarmTimer <= 0) {
      guard.state = 'search';
      guard.searchTimer = SEARCH_DURATION;
    }
    return;
  }

  if (guard.suspicion >= SUSPICION_ALARM) {
    guard.state = 'alarm';
    guard.alarmTimer = ALARM_DURATION;
    events.alarmRaised = true;
    events.alarmGuard = guard.name;
    return;
  }

  if (guard.state === 'search') {
    guard.searchTimer -= dt;
    const arrived = walkToward(guard, guard.lastSeenX, guard.lastSeenY, dt, level);
    strideTick(guard, dt);
    if (arrived || guard.searchTimer <= 0) {
      guard.state = 'patrol';
      guard.suspicion = 0;
    }
    return;
  }

  if (guard.state === 'wary') {
    if (guard.suspicion < SUSPICION_WARY * 0.4) {
      guard.state = 'patrol';
      return;
    }
    // Walk to the last seen spot and look around.
    const arrived = walkToward(guard, guard.lastSeenX, guard.lastSeenY, dt, level);
    strideTick(guard, dt);
    if (arrived) {
      guard.sweepPhase += dt * 1.6;
      guard.facing += Math.sin(guard.sweepPhase) * dt * 1.2;
    }
    return;
  }

  // Patrol: suspicious guards switch to wary; a loud noise draws a look.
  if (guard.suspicion >= SUSPICION_WARY) {
    guard.state = 'wary';
    events.spotted = guard.name;
    return;
  }
  if (heardNoise && guard.suspicion < SUSPICION_WARY) {
    guard.suspicion = Math.min(SUSPICION_WARY - 8, guard.suspicion + 26 * dt);
    guard.lastSeenX = player.x;
    guard.lastSeenY = player.y;
  }

  if (guard.pauseTimer > 0) {
    guard.pauseTimer -= dt;
    guard.sweepPhase += dt;
    guard.facing += Math.sin(guard.sweepPhase * 1.4) * dt * 0.9;
    return;
  }
  const target = guard.waypoints[guard.waypointIndex];
  const arrived = walkToward(guard, target.x, target.y, dt, level);
  strideTick(guard, dt);
  if (arrived) {
    guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
    guard.pauseTimer = guard.pause;
    guard.sweepPhase = 0;
  }
}

// Raise every guard to the alarm at once (a full detection).
export function raiseAlarm(guards, px, py) {
  for (const g of guards) {
    g.state = 'alarm';
    g.alarmTimer = ALARM_DURATION;
    g.suspicion = 100;
    g.lastSeenX = px;
    g.lastSeenY = py;
  }
}
