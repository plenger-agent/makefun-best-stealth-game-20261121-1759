// Night Archive — line of sight, vision cones and suspicion.
// A guard can only see you when you are inside the cone, close enough,
// and no wall or shelf stands between you. Suspicion builds while you are
// seen and decays when you break away, so a near miss is recoverable.

import {
  GUARD_VIEW_HALF_ANGLE,
  SHADOW_DETECTION_MULT,
  SHADOW_SPOT_DISTANCE,
  STANCE_DETECTION_MULT,
  SUSPICION_BUILD_BASE,
  SUSPICION_BUILD_CLOSE,
  SUSPICION_DECAY,
} from './config.js';
import { blockersOf, inShadow } from './level.js';

// Does the segment from (x1,y1) to (x2,y2) cross the rectangle?
function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tMin = 0;
  let tMax = 1;
  if (dx === 0) {
    if (x1 < r.x || x1 > r.x + r.w) return false;
  } else {
    let t1 = (r.x - x1) / dx;
    let t2 = (r.x + r.w - x1) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }
  if (dy === 0) {
    if (y1 < r.y || y1 > r.y + r.h) return false;
  } else {
    let t1 = (r.y - y1) / dy;
    let t2 = (r.y + r.h - y1) / dy;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }
  return true;
}

// True when nothing blocks the straight line between the two points.
export function lineOfSightClear(level, x1, y1, x2, y2) {
  for (const block of blockersOf(level)) {
    if (segmentHitsRect(x1, y1, x2, y2, block)) return false;
  }
  return true;
}

// The angle between the guard's facing and the player, in radians 0..PI.
function angleToGuard(guard, px, py) {
  const target = Math.atan2(py - guard.y, px - guard.x);
  let diff = target - guard.facing;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff);
}

// Full visibility check: distance, cone, line of sight and shadow hiding.
// Returns { seen, strength } — strength 0..1 says how clearly you are seen.
export function guardSeesPlayer(guard, player, level) {
  const dx = player.x - guard.x;
  const dy = player.y - guard.y;
  const distance = Math.hypot(dx, dy);
  if (distance > guard.viewDistance) return { seen: false, strength: 0 };
  if (angleToGuard(guard, player.x, player.y) > GUARD_VIEW_HALF_ANGLE) {
    return { seen: false, strength: 0 };
  }
  if (!lineOfSightClear(level, guard.x, guard.y, player.x, player.y)) {
    return { seen: false, strength: 0 };
  }
  const hidden = inShadow(level, player.x, player.y);
  if (hidden && distance > SHADOW_SPOT_DISTANCE) {
    return { seen: false, strength: 0 };
  }
  // Closer and standing tall reads clearer than far and crouched.
  let strength = 1 - distance / guard.viewDistance;
  strength *= STANCE_DETECTION_MULT[player.stance];
  if (hidden) strength *= SHADOW_DETECTION_MULT;
  return { seen: true, strength: Math.max(0.05, strength) };
}

// One tick of a guard's suspicion meter. When seen, remember where you
// were — that is where a suspicious guard goes to look. Returns the value.
export function updateSuspicion(guard, seen, strength, dt, px, py) {
  if (seen) {
    const closeBonus = strength > 0.7 ? SUSPICION_BUILD_CLOSE : 0;
    guard.suspicion = Math.min(
      100,
      guard.suspicion + (SUSPICION_BUILD_BASE * strength + closeBonus) * dt,
    );
    guard.lastSeenX = px;
    guard.lastSeenY = py;
  } else {
    guard.suspicion = Math.max(0, guard.suspicion - SUSPICION_DECAY * dt);
  }
  return guard.suspicion;
}

// The highest suspicion among all guards — what the HUD meter shows.
export function topSuspicion(guards) {
  let top = 0;
  for (const g of guards) if (g.suspicion > top) top = g.suspicion;
  return top;
}
