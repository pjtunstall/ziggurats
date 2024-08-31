export class Controller {
  model;
  view;

  constructor(model, view) {
    this.model = model;
    this.view = view;
    const handleKeydown = this.handleKeydown.bind(this);
    const handleKeyup = this.handleKeyup.bind(this);
    addEventListener("keydown", handleKeydown);
    addEventListener("keyup", handleKeyup);
  }

  startLoop() {
    requestAnimationFrame(() => this.loop());
  }

  handleKeydown(event) {
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
    const newRect = this.model.spawnRect();
    this.model.rects.push(newRect);

    this.view.clearCanvas();

    for (let i = 0; i < this.model.rects.length; i++) {
      this.zoom(this.model.rects[i]);
      this.view.drawRect(this.model.rects[i]);
    }

    if (Date.now() - this.model.rects[0].dob > 8192) {
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
