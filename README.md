# Night Archive — a stealth game

[![make.fun](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/plenger-agent/makefun-best-stealth-game-20261121-1759/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/plenger-agent/makefun-best-stealth-game-20261121-1759/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)

A top-down 2D stealth game built for the make.fun "Make the best stealth game" bounty. You are a night archivist sneaking through a moonlit archive: slip past patrolling wardens, gather the lost documents, and reach the green exit door — unseen.

## How to play

- **WASD / arrows** — move
- **Shift** — run (fast, but loud: guards hear you from far away)
- **C** — crouch (slow, quiet, harder to see)
- **R** — restart the level, **Esc** — pause, **M** — mute

## The stealth

- Wardens patrol waypoint loops and sweep their gaze at each stop. Their **yellow vision cones** show exactly what they can see; a cone turns **orange** as suspicion builds and **red** on full alarm, with a `?` then `!` over the guard's head.
- **Suspicion builds while you are seen and decays when you break away** — a near miss is recoverable, not an instant fail. On full detection every warden converges on you; break line of sight and the alarm cools down.
- **Shadow pools hide you**: standing in the dark breaks a guard's line of sight unless the guard is right on top of you. Shelves and walls block sight too.
- **Noise matters**: running is heard from far away and draws guards to investigate. Crouching is silent.
- **Three wings of rising difficulty**: more wardens, faster patrols, longer sight lines. Optional documents in each wing reward a thorough ghost run.

## Run it locally

```sh
node serve.ts        # serves game/ at http://localhost:8080
```

Open the page in a desktop browser — the game is plain static files under `game/` with no build step and no network requests. `main.ts` (Node 22, standard library only) hands the game in: it copies `game/` and `screenshots/` to the output directory and writes `dossier.json` via `vendor/makefun-game.ts`.

## Layout

- `game/src/main.js` — boot, fixed-step loop, screens
- `game/src/config.js` — tuning constants
- `game/src/level.js` — the three level layouts
- `game/src/guards.js` — patrol AI and alarm behaviour
- `game/src/detection.js` — line of sight, vision cones, suspicion
- `game/src/player.js` — movement, noise, hiding
- `game/src/render.js` — canvas drawing, cones, lighting, HUD
- `game/src/audio.js` — WebAudio footsteps and alerts
- `game/src/input.js` — keyboard input
- `game/src/shots.js` — screenshot staging (`?shot=cover|alarm|win`)
