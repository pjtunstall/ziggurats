export class Controller {
  model;
  view;
  keysPressed;

  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.keysPressed = {};
    const handleKeydown = this.handleKeydown.bind(this);
    const handleKeyup = this.handleKeyup.bind(this);
    addEventListener("keydown", handleKeydown);
    addEventListener("keyup", handleKeyup);
  }

  startLoop() {
    requestAnimationFrame(() => this.loop());
  }

  handleKeydown(event) {
    this.keysPressed[event.code] = true;
    switch (event.key) {
      case "Tab":
        event.preventDefault();
        this.model.speed = this.model.slow;
        break;
      case "q":
      case "Q":
        this.model.speed = this.model.fast;
        break;
      case "ArrowUp":
        this.model.midY -= this.model.omega;
        if (this.keysPressed["ArrowLeft"]) {
          this.model.midX -= this.model.omega;
          break;
        }
        if (this.keysPressed["ArrowRight"]) {
          this.model.midX += this.model.omega;
          break;
        }
        break;
      case "ArrowDown":
        this.model.midY += this.model.omega;
        if (this.keysPressed["ArrowLeft"]) {
          this.model.midX -= this.model.omega;
          break;
        }
        if (this.keysPressed["ArrowRight"]) {
          this.model.midX += this.model.omega;
          break;
        }
        break;
      case "ArrowLeft":
        this.model.midX -= this.model.omega;
        if (this.keysPressed["ArrowUp"]) {
          this.model.midY -= this.model.omega;
          break;
        }
        if (this.keysPressed["ArrowDown"]) {
          this.model.midY += this.model.omega;
          break;
        }
        break;
      case "ArrowRight":
        this.model.midX += this.model.omega;
        if (this.keysPressed["ArrowUp"]) {
          this.model.midY -= this.model.omega;
          break;
        }
        if (this.keysPressed["ArrowDown"]) {
          this.model.midY += this.model.omega;
          break;
        }
        break;
      case " ":
        if (!this.model.isFireDelay) {
          this.model.isFire = true;
          this.model.isFireDelay = true;
          setTimeout(() => {
            this.model.isFire = false;
            setTimeout(() => {
              this.model.isFireDelay = false;
            }, 222);
          }, 100);
        }
    }
  }

  handleKeyup(event) {
    this.keysPressed[event.code] = false;
    switch (event.key) {
      case "Tab":
      case "q":
      case "Q":
        this.model.speed = this.model.normal;
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

  loop() {
    requestAnimationFrame(() => this.loop());

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

    this.view.drawCrosshairs(this.model);
    this.model.midX -= (this.model.midX - innerWidth / 2) * this.model.drift;
    this.model.midY -= (this.model.midY - innerHeight / 2) * this.model.drift;

    if (this.model.isFire) {
      this.view.drawFire(this.model);
    }
  }
}
