// Night Archive — screenshot staging.
// ?shot=cover | alarm | win sets the game up as a still from a real play
// session, using the same state the game itself builds: the player is
// placed, the guards are placed mid-patrol, suspicion is set, and the
// normal update loop keeps running so cones and timers stay alive.
// Nothing here edits pixels — the screenshots are honest renders.

export function stageShot(game, query) {
  const shot = query.get('shot');
  if (!shot) return null;

  if (shot === 'cover') {
    // Mid-game, level 1: the player crouches below a shelf at the edge of
    // a warden's cone, the green exit door visible, HUD legible.
    game.screen = 'playing';
    game.player.x = 640;
    game.player.y = 380;
    game.player.stance = 'crouch';
    game.player.facing = -Math.PI / 2;
    const guard = game.guards[0];
    guard.x = 560;
    guard.y = 300;
    guard.facing = Math.PI / 4 + 0.45;
    guard.suspicion = 38;
    guard.state = 'patrol';
    const second = game.guards[1];
    second.x = 1080;
    second.y = 300;
    second.facing = Math.PI;
    second.suspicion = 0;
    game.collectedDocs.add(0);
    game.docsCollected = 1;
    game.toast = 'One document found — two wardens on patrol';
    return 'cover';
  }

  if (shot === 'alarm') {
    // The near-miss moment: a warden has spotted you, cone red, "!" up,
    // suspicion full, the alarm banner on screen.
    game.screen = 'playing';
    game.player.x = 620;
    game.player.y = 420;
    game.player.stance = 'run';
    game.player.facing = Math.PI;
    const guard = game.guards[0];
    guard.x = 700;
    guard.y = 380;
    guard.facing = Math.atan2(game.player.y - guard.y, game.player.x - guard.x);
    guard.suspicion = 100;
    guard.state = 'alarm';
    guard.alarmTimer = 4.2;
    const second = game.guards[1];
    second.x = 950;
    second.y = 500;
    second.facing = Math.atan2(game.player.y - second.y, game.player.x - second.x);
    second.suspicion = 100;
    second.state = 'alarm';
    second.alarmTimer = 4.2;
    game.alarmBanner = 3;
    game.toast = 'Run! Break the line of sight to lose them';
    return 'alarm';
  }

  if (shot === 'win') {
    // The level-clear screen after ghosting level 1.
    game.screen = 'levelClear';
    game.levelTimeText = '02:41';
    game.docsCollected = 2;
    game.collectedDocs.add(0);
    game.collectedDocs.add(1);
    game.player.x = 1210;
    game.player.y = 130;
    return 'win';
  }

  return null;
}
