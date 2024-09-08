import { Model } from "./models.js";
import { View } from "./views.js";

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
    this.setMidpoint();
    this.setCrossVariablesForView();
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
    this.view.worker.terminate();
    this.model = new Model();
    this.view = new View();
    this.setMidpoint();
  }

  setMidpoint() {
    this.model.midX = (this.view.dpr * innerWidth) / 2;
    this.model.midY = (this.view.dpr * innerHeight) / 2;
    this.view.midX = this.model.midX;
    this.view.midY = this.model.midY;
  }

  setCrossVariablesForView() {
    this.view.targetXOfStaticImage = this.view.midX - this.view.crossSize / 2;
    this.view.targetYOfStaticImage =
      this.view.midY - this.view.targetXOfStaticImage;
  }

  handleClick(x, y) {
    this.view.worker.postMessage({ type: "click", x, y });
  }

  loop(timestamp) {
    requestAnimationFrame((timestamp) => this.loop(timestamp));

    if (timestamp - this.lastTimestamp < 16) {
      return;
    }
    this.lastTimestamp = timestamp;

    this.keysPressed.forEach((code) => {
      this.actOnKeydown(code);
    });
  }

  startLoop() {
    this.loopId = this.model.rAFForInputs
      ? requestAnimationFrame((timestamp) => this.loop(timestamp))
      : setInterval(() => {
          this.keysPressed.forEach((code) => {
            this.actOnKeydown(code);
          });
        }, 16);
  }
}
