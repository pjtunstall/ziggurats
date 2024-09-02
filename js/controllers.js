import { Model } from "./models.js";
import { View } from "./views.js";

export class Controller {
  model;
  view;
  keysPressed;
  loopId;

  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.keysPressed = new Set();
    this.view.addEventListener("keydown", (keyCode) =>
      this.handleKeydown(keyCode)
    );
    this.view.addEventListener("keyup", (keyCode) => this.handleKeyup(keyCode));
    this.view.addEventListener("click", (x, y) => this.handleClick(x, y));
  }

  handleKeydown(keyCode) {
    this.keysPressed.add(keyCode);
  }

  handleKeyup(keyCode) {
    this.keysPressed.clear(keyCode);
    switch (keyCode) {
      case "Tab":
      case "KeyQ":
        this.model.speed = this.model.normal;
    }
  }

  handleClick(x, y) {
    const deltaX = x - this.model.midX;
    const deltaY = y - this.model.midY;
    this.translate("midX", 1, deltaX);
    this.translate("midY", 1, deltaY);
  }

  // Called from `this.loop` on each key code in the set `keysPressed` so as to allow multiple key presses to be processed at once.
  actOnKeydown(keyCode) {
    switch (keyCode) {
      case "Tab":
        this.model.speed = this.model.slow;
        break;
      case "KeyQ":
        this.model.speed = this.model.fast;
        break;
      case "ArrowUp":
        this.translate("midY", -1, this.model.omega);
        break;
      case "ArrowDown":
        this.translate("midY", 1, this.model.omega);
        break;
      case "ArrowLeft":
        this.translate("midX", -1, this.model.omega);
        break;
      case "ArrowRight":
        this.translate("midX", 1, this.model.omega);
        break;
      case "KeyZ": {
        this.roll(-Math.PI / 64);
        break;
      }
      case "KeyX":
        this.roll(Math.PI / 64);
        break;
      case "Space":
        this.model = new Model();
        this.view = new View();
        break;
    }
  }

  translate(axis, sign, distance) {
    this.view.roll(-this.model.theta, this.model.midX, this.model.midY); // correction for rotation
    for (const rect of this.model.rects) {
      if (axis === "midX") {
        rect.x -= sign * distance;
      } else {
        rect.y -= sign * distance;
      }
    }
    this.view.roll(this.model.theta, this.model.midX, this.model.midY);
  }

  roll(deltaRoll) {
    this.view.roll(deltaRoll, this.model.midX, this.model.midY);
    this.model.theta += deltaRoll;
  }

  zoom(rect) {
    const widthIncrease = rect.width * this.model.speed;
    const heightIncrease = rect.height * this.model.speed;

    rect.width += widthIncrease;
    rect.height += heightIncrease;

    rect.x -= widthIncrease / 2;
    rect.y -= heightIncrease / 2;
  }

  loop() {
    requestAnimationFrame(() => this.loop());

    this.keysPressed.forEach((code) => {
      this.actOnKeydown(code);
    });

    this.view.clearCanvas();

    this.model.spawnRect();
    for (let i = 0; i < this.model.rects.length; i++) {
      const rect = this.model.rects[i];
      this.zoom(rect);
      this.view.drawRect(rect);
    }
    if (this.model.rects.length > 255) {
      this.model.rects = this.model.rects.slice(1);
    }

    this.view.drawCrosshairs(this.model.midX, this.model.midY);
  }

  startLoop() {
    this.loopId = requestAnimationFrame(() => this.loop());
  }
}
