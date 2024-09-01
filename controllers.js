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
    this.wrapEventListener("keydown", this.handleKeydown);
    this.wrapEventListener("keyup", this.handleKeyup);
    this.wrapEventListener("click", this.handleClick);
  }

  wrapEventListener(eventType, handler) {
    const boundHandler = handler.bind(this);
    addEventListener(eventType, boundHandler);
  }

  handleKeydown(event) {
    if (event.key === "Tab") {
      event.preventDefault();
    }
    this.keysPressed.add(event.key);
  }

  // Called from `this.loop` on each key in the set `keysPressed`.
  actOnKeydown(key) {
    switch (key) {
      case "Tab":
        this.model.speed = this.model.slow;
        break;
      case "q":
      case "Q":
        this.model.speed = this.model.fast;
        break;
      case "ArrowUp":
        this.model.midY -= this.model.omega;
        break;
      case "ArrowDown":
        this.model.midY += this.model.omega;
        break;
      case "ArrowLeft":
        this.model.midX -= this.model.omega;
        break;
      case "ArrowRight":
        this.model.midX += this.model.omega;
        break;
      case "z":
      case "Z":
        this.view.roll(-Math.PI / 16, this.model.midX, this.model.midY);
        break;
      case "x":
      case "X":
        this.view.roll(Math.PI / 16, this.model.midX, this.model.midY);
        break;
      case " ":
        this.model = new Model();
        this.view = new View();
        break;
    }
  }

  handleKeyup(event) {
    this.keysPressed.clear(event.key);
    switch (event.key) {
      case "Tab":
      case "q":
      case "Q":
        this.model.speed = this.model.normal;
    }
  }

  handleClick(event) {
    this.model.midX = event.clientX;
    this.model.midY = event.clientY;
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

    this.keysPressed.forEach((key) => {
      this.actOnKeydown(key);
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
