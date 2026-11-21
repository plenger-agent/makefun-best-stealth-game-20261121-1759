// Night Archive — the player: a night archivist sneaking for documents.
// Walk, run or crouch. Running is fast and loud; crouching is slow, quiet
// and harder to see. Standing in a shadow pool hides you from a guard's
// cone unless the guard is right on top of you.

import { MOVE_SPEED, NOISE_RADIUS, PLAYER_RADIUS } from './config.js';
import { blockersOf, inShadow } from './level.js';

export function makePlayer(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    radius: PLAYER_RADIUS,
    stance: 'walk', // walk | run | crouch
    facing: -Math.PI / 2,
    moving: false,
    noiseRadius: 0,
    hidden: false,
    stepTimer: 0,
    stepped: false,
  };
}

// Slide the player circle out of every blocker rectangle it overlaps.
function resolveCollisions(player, level) {
  for (const b of blockersOf(level)) {
    const cx = Math.max(b.x, Math.min(player.x, b.x + b.w));
    const cy = Math.max(b.y, Math.min(player.y, b.y + b.h));
    const dx = player.x - cx;
    const dy = player.y - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < player.radius) {
      if (dist === 0) {
        player.y = b.y - player.radius;
      } else {
        player.x = cx + (dx / dist) * player.radius;
        player.y = cy + (dy / dist) * player.radius;
      }
    }
  }
}

export function updatePlayer(player, input, level, dt) {
  const dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  player.moving = dx !== 0 || dy !== 0;

  player.stance = input.crouch ? 'crouch' : input.run ? 'run' : 'walk';
  const speed = MOVE_SPEED[player.stance];
  player.noiseRadius = NOISE_RADIUS[player.stance];

  if (player.moving) {
    const len = Math.hypot(dx, dy);
    player.x += (dx / len) * speed * dt;
    player.y += (dy / len) * speed * dt;
    player.facing = Math.atan2(dy, dx);
    resolveCollisions(player, level);
    // Keep inside the play area.
    player.x = Math.max(8 + player.radius, Math.min(1280 - 8 - player.radius, player.x));
    player.y = Math.max(60 + player.radius, Math.min(720 - 8 - player.radius, player.y));
    // A footstep tick per stride, faster when running.
    player.stepTimer -= dt;
    if (player.stepTimer <= 0) {
      player.stepTimer = player.stance === 'run' ? 0.28 : player.stance === 'walk' ? 0.42 : 0.6;
      player.stepped = true;
    } else {
      player.stepped = false;
    }
  } else {
    player.stepped = false;
    player.noiseRadius = 0;
  }

  player.hidden = inShadow(level, player.x, player.y);
}
