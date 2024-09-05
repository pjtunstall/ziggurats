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
        this.model.speed = this.model.normal;
    }
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
        this.translate("y", -1, this.model.omega);
        break;
      case "ArrowDown":
        this.translate("y", 1, this.model.omega);
        break;
      case "ArrowLeft":
        this.translate("x", -1, this.model.omega);
        break;
      case "ArrowRight":
        this.translate("x", 1, this.model.omega);
        break;
      case "KeyZ": {
        const delta = -Math.PI / 64;
        this.model.theta += delta;
        this.view.roll(delta);
        break;
      }
      case "KeyX":
        const delta = Math.PI / 64;
        this.model.theta += delta;
        this.view.roll(delta);
        break;
      case "Space":
        this.reset();
        break;
    }
  }

  reset() {
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
    this.view.roll(-this.model.theta);
    const deltaX = x - this.model.midX;
    const deltaY = y - this.model.midY;
    this.translate("x", 1, -deltaX);
    this.translate("y", 1, -deltaY);
    this.view.roll(this.model.theta);
  }

  // Unrolled loop for better performance. See README.
  translate(axis, sign, distance) {
    let k;
    const difference = -sign * distance;
    for (let i = 0; i < Math.floor(this.model.rects[0].length / 8); i++) {
      k = 8 * i;
      this.model.rects[0][k++][axis] += difference;
      this.model.rects[0][k++][axis] += difference;
      this.model.rects[0][k++][axis] += difference;
      this.model.rects[0][k++][axis] += difference;
      this.model.rects[0][k++][axis] += difference;
      this.model.rects[0][k++][axis] += difference;
      this.model.rects[0][k++][axis] += difference;
      this.model.rects[0][k][axis] += difference;
    }
    for (let i = 1; i <= this.model.rects[0].length % 8; i++) {
      this.model.rects[0][this.model.rects[0].length - i][axis] += difference;
    }
    for (let i = 0; i < Math.floor(this.model.rects[1].length / 8); i++) {
      k = 8 * i;
      this.model.rects[1][k++][axis] += difference;
      this.model.rects[1][k++][axis] += difference;
      this.model.rects[1][k++][axis] += difference;
      this.model.rects[1][k++][axis] += difference;
      this.model.rects[1][k++][axis] += difference;
      this.model.rects[1][k++][axis] += difference;
      this.model.rects[1][k++][axis] += difference;
      this.model.rects[1][k][axis] += difference;
    }
    for (let i = 1; i <= this.model.rects[1].length % 8; i++) {
      this.model.rects[1][this.model.rects[1].length - i][axis] += difference;
    }
  }

  zoom(rect) {
    const widthIncrease = rect.width * this.model.speed;
    const heightIncrease = rect.height * this.model.speed;

    rect.width += widthIncrease;
    rect.height += heightIncrease;

    rect.x -= widthIncrease / 2;
    rect.y -= heightIncrease / 2;
  }

  drawRects() {
    let k;
    for (let i = 0; i < Math.floor(this.model.rects[0].length / 8); i++) {
      k = 8 * i;
      this.view.fillRect(this.model.rects[0][k++]);
      this.view.fillRect(this.model.rects[0][k++]);
      this.view.fillRect(this.model.rects[0][k++]);
      this.view.fillRect(this.model.rects[0][k++]);
      this.view.fillRect(this.model.rects[0][k++]);
      this.view.fillRect(this.model.rects[0][k++]);
      this.view.fillRect(this.model.rects[0][k++]);
      this.view.fillRect(this.model.rects[0][k]);
    }
    for (let i = 1; i <= this.model.rects[0].length % 8; i++) {
      this.view.fillRect(this.model.rects[0][this.model.rects[0].length - i]);
    }
    for (let i = 0; i < Math.floor(this.model.rects[1].length / 8); i++) {
      k = 8 * i;
      this.view.strokeRect(this.model.rects[1][k++]);
      this.view.strokeRect(this.model.rects[1][k++]);
      this.view.strokeRect(this.model.rects[1][k++]);
      this.view.strokeRect(this.model.rects[1][k++]);
      this.view.strokeRect(this.model.rects[1][k++]);
      this.view.strokeRect(this.model.rects[1][k++]);
      this.view.strokeRect(this.model.rects[1][k++]);
      this.view.strokeRect(this.model.rects[1][k]);
    }
    for (let i = 1; i <= this.model.rects[1].length % 8; i++) {
      this.view.strokeRect(this.model.rects[1][this.model.rects[1].length - i]);
    }
    this.view.copyRects();
  }

  loop(timestamp) {
    requestAnimationFrame((timestamp) => this.loop(timestamp));

    this.view.clearCanvas();
    this.drawRects();
    this.view.copyCrosshairs();

    if (timestamp - this.lastTimestamp < 16) {
      return;
    }
    this.lastTimestamp = timestamp;

    this.keysPressed.forEach((code) => {
      this.actOnKeydown(code);
    });

    this.model.spawnRect();

    let k;
    for (let i = 0; i < Math.floor(this.model.rects[0].length / 8); i++) {
      k = 8 * i;
      this.zoom(this.model.rects[0][k++]);
      this.zoom(this.model.rects[0][k++]);
      this.zoom(this.model.rects[0][k++]);
      this.zoom(this.model.rects[0][k++]);
      this.zoom(this.model.rects[0][k++]);
      this.zoom(this.model.rects[0][k++]);
      this.zoom(this.model.rects[0][k++]);
      this.zoom(this.model.rects[0][k]);
    }
    for (let i = 1; i <= this.model.rects[0].length % 8; i++) {
      this.zoom(this.model.rects[0][this.model.rects[0].length - i]);
    }
    for (let i = 0; i < Math.floor(this.model.rects[0].length / 8); i++) {
      k = 8 * i;
      this.zoom(this.model.rects[1][k++]);
      this.zoom(this.model.rects[1][k++]);
      this.zoom(this.model.rects[1][k++]);
      this.zoom(this.model.rects[1][k++]);
      this.zoom(this.model.rects[1][k++]);
      this.zoom(this.model.rects[1][k++]);
      this.zoom(this.model.rects[1][k++]);
      this.zoom(this.model.rects[1][k]);
    }
    for (let i = 1; i <= this.model.rects[1].length % 8; i++) {
      this.zoom(this.model.rects[1][this.model.rects[1].length - i]);
    }

    if (this.model.rects[0].length > 85) {
      this.model.rects[0].shift();
    }
    if (this.model.rects[1].length > 170) {
      this.model.rects[1].shift();
    }
  }

  startLoop() {
    this.loopId = requestAnimationFrame((timestamp) => this.loop(timestamp));
  }
}
