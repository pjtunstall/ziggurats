export class Controller {
  model;
  view;
  keysPressed;
  loopId;
  lastTimestamp;

  constructor(model, view) {
    this.lastTimestamp = 0;
    this.model = model;
    this.view = view;
    this.keysPressed = new Set();
    this.view.addEventListener("keydown", (keyCode) =>
      this.handleKeydown(keyCode)
    );
    this.view.addEventListener("keyup", (keyCode) => this.handleKeyup(keyCode));
    this.view.addEventListener("click", (x, y) => this.handleClick(x, y));
    this.view.addEventListener("resize", () => this.reset());
  }

  handleKeydown(keyCode) {
    this.keysPressed.add(keyCode);
  }

  handleKeyup(keyCode) {
    this.keysPressed.delete(keyCode);
    switch (keyCode) {
      case "Tab":
      case "KeyQ":
        this.view.worker.postMessage({
          type: "speed",
          speed: this.model.normal,
        });
    }
  }

  // Called from `this.loop` on each key code in the set `keysPressed` so as to allow multiple key presses to be processed at once.
  actOnKeydown(keyCode) {
    switch (keyCode) {
      case "Tab":
        this.view.worker.postMessage({ type: "speed", speed: this.model.slow });
        return;
      case "KeyQ":
        this.view.worker.postMessage({ type: "speed", speed: this.model.fast });
        return;
      case "ArrowUp":
        this.view.worker.postMessage({
          type: "translate",
          axis: "y",
          sign: -1,
          distance: this.model.omega,
        });
        return;
      case "ArrowDown":
        this.view.worker.postMessage({
          type: "translate",
          axis: "y",
          sign: 1,
          distance: this.model.omega,
        });
        return;
      case "ArrowLeft":
        this.view.worker.postMessage({
          type: "translate",
          axis: "x",
          sign: -1,
          distance: this.model.omega,
        });
        return;
      case "ArrowRight":
        this.view.worker.postMessage({
          type: "translate",
          axis: "x",
          sign: 1,
          distance: this.model.omega,
        });
        return;
      case "KeyZ": {
        this.view.worker.postMessage({ type: "roll", clockwise: false });
        return;
      }
      case "KeyX":
        this.view.worker.postMessage({ type: "roll", clockwise: true });
        return;
      case "Space":
        this.reset();
    }
  }

  reset() {
    this.view.setCanvasSize(innerWidth, innerHeight);
  }

  handleClick(x, y) {
    this.view.worker.postMessage({ type: "click", x, y });
  }

  startLoop() {
    this.loopId = setInterval(() => {
      this.keysPressed.forEach((code) => {
        this.actOnKeydown(code);
      });
    }, 16);
  }
}
