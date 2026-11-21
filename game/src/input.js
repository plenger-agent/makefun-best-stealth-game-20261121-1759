// Night Archive — keyboard input, shared by the game and the screenshot
// staging. Keys are tracked by their physical code so layouts do not matter.

const KEY_MAP = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  ShiftLeft: 'run',
  ShiftRight: 'run',
  KeyC: 'crouch',
  ControlLeft: 'crouch',
  Space: 'interact',
  Enter: 'confirm',
  KeyR: 'restart',
  KeyM: 'mute',
  Escape: 'pause',
};

export function createInput() {
  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    run: false,
    crouch: false,
    interact: false,
    confirm: false,
    restart: false,
    mute: false,
    pause: false,
    // One-shot flags: true only on the frame the key went down.
    pressed: {},
  };

  function onKeyDown(event) {
    const action = KEY_MAP[event.code];
    if (!action) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
    if (!input[action]) input.pressed[action] = true;
    input[action] = true;
  }

  function onKeyUp(event) {
    const action = KEY_MAP[event.code];
    if (!action) return;
    input[action] = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // Clear the one-shot flags after the game has read them for this frame.
  input.endFrame = () => {
    input.pressed = {};
  };

  input.wasPressed = (action) => Boolean(input.pressed[action]);

  return input;
}
