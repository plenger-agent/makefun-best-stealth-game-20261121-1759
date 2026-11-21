// Night Archive — everything drawn on the canvas: the moonlit floor,
// shelves and walls, shadow pools, the exit door, documents, the player,
// the guards and their vision cones, the HUD and the title/win/caught
// screens. The cover screenshot must read at a glance, so the HUD is big
// and the cones are bright against the dark floor.

import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, HUD_HEIGHT } from './config.js';
import { SUSPICION_ALARM, SUSPICION_WARY } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFloor(ctx, level) {
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, HUD_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT - HUD_HEIGHT);
  // Wood planks.
  const tile = 64;
  for (let y = HUD_HEIGHT; y < CANVAS_HEIGHT; y += tile) {
    for (let x = 0; x < CANVAS_WIDTH; x += tile) {
      if (((x / tile + y / tile) | 0) % 2 === 0) {
        ctx.fillStyle = COLORS.floorAlt;
        ctx.fillRect(x, y, tile, tile);
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.strokeRect(x + 0.5, y + 0.5, tile, tile);
    }
  }
  // Moonlight pools on the floor.
  for (const pool of level.moonPools) {
    const g = ctx.createRadialGradient(pool.x, pool.y, 8, pool.x, pool.y, pool.r);
    g.addColorStop(0, COLORS.moonPool);
    g.addColorStop(1, 'rgba(190,205,235,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(pool.x, pool.y, pool.r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Shadow pools: dark, safe places to hide.
  for (const s of level.shadows) {
    ctx.fillStyle = COLORS.shadowPool;
    roundRect(ctx, s.x, s.y, s.w, s.h, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(140,160,220,0.18)';
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawWallsAndShelves(ctx, level) {
  for (const w of level.walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = COLORS.wallEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x + 1, w.y + 1, w.w - 2, w.h - 2);
  }
  for (const s of level.shelves) {
    ctx.fillStyle = COLORS.shelf;
    roundRect(ctx, s.x, s.y, s.w, s.h, 6);
    ctx.fill();
    ctx.fillStyle = COLORS.shelfTop;
    ctx.fillRect(s.x + 4, s.y + 4, s.w - 8, 8);
    // Book spines along the shelf.
    for (let x = s.x + 8; x < s.x + s.w - 10; x += 12) {
      const color = COLORS.bookSpine[Math.floor(x / 12) % COLORS.bookSpine.length];
      ctx.fillStyle = color;
      ctx.fillRect(x, s.y + 14, 8, s.h - 18);
    }
  }
}

function drawExit(ctx, level, time) {
  const e = level.exit;
  const pulse = 0.25 + 0.12 * Math.sin(time * 3);
  ctx.fillStyle = COLORS.exitGlow.replace('0.35', String(pulse));
  ctx.fillRect(e.x - 14, e.y - 14, e.w + 28, e.h + 28);
  ctx.fillStyle = COLORS.exitDoor;
  roundRect(ctx, e.x, e.y, e.w, e.h, 8);
  ctx.fill();
  ctx.strokeStyle = '#b8f5cd';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#0d2b18';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', e.x + e.w / 2, e.y + e.h / 2 - 4);
  ctx.font = '11px sans-serif';
  ctx.fillText('the green door', e.x + e.w / 2, e.y + e.h / 2 + 14);
}

function drawDocuments(ctx, level, collected) {
  level.documents.forEach((doc, i) => {
    if (collected.has(i)) return;
    ctx.save();
    ctx.translate(doc.x, doc.y);
    ctx.rotate(0.15);
    ctx.fillStyle = COLORS.doc;
    ctx.fillRect(-9, -12, 18, 24);
    ctx.strokeStyle = '#8a7f66';
    ctx.lineWidth = 1;
    ctx.strokeRect(-9, -12, 18, 24);
    ctx.strokeStyle = '#5a5142';
    ctx.beginPath();
    ctx.moveTo(-5, -6);
    ctx.lineTo(5, -6);
    ctx.moveTo(-5, -1);
    ctx.lineTo(5, -1);
    ctx.moveTo(-5, 4);
    ctx.lineTo(2, 4);
    ctx.stroke();
    ctx.restore();
  });
}

function coneColor(guard) {
  if (guard.state === 'alarm' || guard.suspicion >= SUSPICION_ALARM) return COLORS.coneAlarm;
  if (guard.state === 'wary' || guard.suspicion >= SUSPICION_WARY) return COLORS.coneWary;
  return COLORS.coneCalm;
}

function drawGuard(ctx, guard, time) {
  // Vision cone.
  const half = 0.56;
  ctx.fillStyle = coneColor(guard);
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.arc(guard.x, guard.y, guard.viewDistance, guard.facing - half, guard.facing + half);
  ctx.closePath();
  ctx.fill();
  // Cone edge line.
  ctx.strokeStyle = coneColor(guard).replace(/[\d.]+\)$/, '0.7)');
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Body: a warden in a dark coat, bright against the floor.
  ctx.fillStyle = COLORS.guard;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.guardDark;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, 14, 0, Math.PI * 2);
  ctx.strokeStyle = '#f2c14e';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Facing tick.
  ctx.strokeStyle = '#f2c14e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.lineTo(guard.x + Math.cos(guard.facing) * 20, guard.y + Math.sin(guard.facing) * 20);
  ctx.stroke();
  // Helmet lamp dot.
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(guard.x + Math.cos(guard.facing) * 8, guard.y + Math.sin(guard.facing) * 8, 3, 0, Math.PI * 2);
  ctx.fill();

  // "?" when wary, "!" when alarmed, bobbing above the head.
  let mark = null;
  if (guard.state === 'alarm' || guard.suspicion >= SUSPICION_ALARM) mark = '!';
  else if (guard.state === 'wary' || guard.suspicion >= SUSPICION_WARY) mark = '?';
  if (mark) {
    const bob = Math.sin(time * 5) * 2;
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = mark === '!' ? '#ff5a5a' : '#ffb020';
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 4;
    ctx.strokeText(mark, guard.x, guard.y - 26 + bob);
    ctx.fillText(mark, guard.x, guard.y - 26 + bob);
  }

  // Suspicion arc over the guard.
  if (guard.suspicion > 2) {
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 20, -Math.PI / 2, Math.PI * 1.5);
    ctx.stroke();
    ctx.strokeStyle = guard.suspicion >= SUSPICION_WARY ? '#f97316' : '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(
      guard.x,
      guard.y,
      20,
      -Math.PI / 2,
      -Math.PI / 2 + (guard.suspicion / 100) * Math.PI * 2,
    );
    ctx.stroke();
  }

  // Name tag.
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(240,230,210,0.85)';
  ctx.fillText(guard.name, guard.x, guard.y + 32);
}

function drawPlayer(ctx, player, time) {
  // Noise ring while running or walking.
  if (player.noiseRadius > 0) {
    ctx.strokeStyle = 'rgba(46,196,182,0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.noiseRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  const crouchScale = player.stance === 'crouch' ? 0.82 : 1;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.scale(1, crouchScale);
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.playerCloak;
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.strokeStyle = '#a7f3ea';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Hood point in the facing direction.
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.moveTo(Math.cos(player.facing) * 12, Math.sin(player.facing) * 12);
  ctx.lineTo(
    Math.cos(player.facing + 2.4) * 9,
    Math.sin(player.facing + 2.4) * 9,
  );
  ctx.lineTo(
    Math.cos(player.facing - 2.4) * 9,
    Math.sin(player.facing - 2.4) * 9,
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  if (player.hidden) {
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c7d2fe';
    ctx.fillText('HIDDEN', player.x, player.y - 22);
  }
  if (player.stance === 'crouch') {
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(240,230,210,0.75)';
    ctx.fillText('crouching', player.x, player.y + 28);
  }
}

function alertWord(state) {
  if (state === 'alarm') return { word: 'ALARM', color: COLORS.alertRed };
  if (state === 'wary') return { word: 'SUSPICIOUS', color: COLORS.alertAmber };
  return { word: 'UNSEEN', color: COLORS.alertGreen };
}

export function drawHUD(ctx, game) {
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = '#3a2f22';
  ctx.fillRect(0, HUD_HEIGHT - 2, CANVAS_WIDTH, 2);

  const alert = alertWord(game.alertState);
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('NIGHT ARCHIVE', 16, 26);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = COLORS.hudDim;
  ctx.fillText(game.level.name, 16, 46);

  // Alert state.
  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = alert.color;
  ctx.fillText(alert.word, 330, 26);
  ctx.font = '12px sans-serif';
  ctx.fillStyle = COLORS.hudDim;
  ctx.fillText('alert state', 330, 46);

  // Suspicion meter.
  const suspicion = game.topSuspicion;
  ctx.fillStyle = COLORS.hudDim;
  ctx.font = '12px sans-serif';
  ctx.fillText('suspicion', 520, 18);
  ctx.fillStyle = '#2a211a';
  roundRect(ctx, 520, 24, 200, 14, 7);
  ctx.fill();
  ctx.fillStyle = suspicion >= SUSPICION_WARY ? '#f97316' : '#facc15';
  if (suspicion > 0) {
    roundRect(ctx, 520, 24, 200 * (suspicion / 100), 14, 7);
    ctx.fill();
  }
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`${Math.round(suspicion)}%`, 728, 36);

  // Documents.
  ctx.fillStyle = COLORS.hudDim;
  ctx.font = '12px sans-serif';
  ctx.fillText('documents', 800, 18);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(`${game.docsCollected} / ${game.level.documents.length}`, 800, 40);

  // Timer.
  ctx.fillStyle = COLORS.hudDim;
  ctx.font = '12px sans-serif';
  ctx.fillText('time', 930, 18);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 18px sans-serif';
  const t = Math.floor(game.elapsed);
  ctx.fillText(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`, 930, 40);

  // Controls hint.
  ctx.fillStyle = COLORS.hudDim;
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('WASD move · Shift run · C crouch · R restart', CANVAS_WIDTH - 16, 26);
  ctx.fillText('hide in the dark pools · reach the green door', CANVAS_WIDTH - 16, 46);
  ctx.textAlign = 'left';
}

export function drawWorld(ctx, game, time) {
  drawFloor(ctx, game.level);
  drawExit(ctx, game.level, time);
  drawDocuments(ctx, game.level, game.collectedDocs);
  drawWallsAndShelves(ctx, game.level);
  for (const guard of game.guards) drawGuard(ctx, guard, time);
  drawPlayer(ctx, game.player, time);
}

function overlayPanel(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(10, 8, 6, 0.72)';
  ctx.fillRect(0, HUD_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT - HUD_HEIGHT);
  const w = 640;
  const h = 120 + lines.length * 30;
  const x = (CANVAS_WIDTH - w) / 2;
  const y = (CANVAS_HEIGHT - h) / 2;
  ctx.fillStyle = '#1d1712';
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(title, CANVAS_WIDTH / 2, y + 58);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '17px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, CANVAS_WIDTH / 2, y + 100 + i * 30);
  });
}

export function drawScreen(ctx, game, time) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (game.screen === 'title') {
    drawWorld(ctx, game, time);
    overlayPanel(
      ctx,
      'NIGHT ARCHIVE',
      [
        'A stealth game in a moonlit archive.',
        'Sneak past the wardens, gather the lost documents,',
        'and reach the green door — unseen.',
        '',
        'Press Enter to begin · WASD to move · Shift to run · C to crouch',
      ],
      '#f2c14e',
    );
    return;
  }
  if (game.screen === 'levelClear') {
    drawWorld(ctx, game, time);
    overlayPanel(
      ctx,
      game.levelIndex + 1 >= game.levelCount ? 'THE ARCHIVE IS YOURS' : 'LEVEL CLEAR',
      [
        `${game.level.name} — cleared in ${game.levelTimeText}.`,
        `Documents found: ${game.docsCollected} of ${game.level.documents.length}.`,
        game.levelIndex + 1 >= game.levelCount
          ? 'You ghosted every wing. Press Enter to play again.'
          : 'Press Enter for the next wing.',
      ],
      '#4ade80',
    );
    return;
  }
  if (game.screen === 'caught') {
    drawWorld(ctx, game, time);
    overlayPanel(
      ctx,
      'CAUGHT!',
      [
        'A warden laid hands on you in the dark.',
        'The archive keeps its secrets — this time.',
        'Press R to try the level again.',
      ],
      '#f87171',
    );
    return;
  }
  if (game.screen === 'paused') {
    drawWorld(ctx, game, time);
    overlayPanel(ctx, 'PAUSED', ['Press Esc to keep sneaking.'], '#f2c14e');
    return;
  }
  drawWorld(ctx, game, time);
  drawHUD(ctx, game);
  // A short banner when the alarm first sounds.
  if (game.alarmBanner > 0) {
    ctx.textAlign = 'center';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = 'rgba(248,113,113,0.95)';
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 5;
    ctx.strokeText('ALARM — THEY KNOW YOU ARE HERE', CANVAS_WIDTH / 2, 120);
    ctx.fillText('ALARM — THEY KNOW YOU ARE HERE', CANVAS_WIDTH / 2, 120);
    ctx.textAlign = 'left';
  }
  if (game.toast) {
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = 'rgba(240,230,210,0.95)';
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 4;
    ctx.strokeText(game.toast, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 24);
    ctx.fillText(game.toast, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 24);
    ctx.textAlign = 'left';
  }
}
