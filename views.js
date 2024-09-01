export class View {
  canvas;
  ctx;
  crossSize;

  constructor() {
    this.canvas = document.getElementById("canvas");
    this.sizeCanvas();
    this.ctx = this.canvas.getContext("2d");
    this.crossSize = 10;
  }

  sizeCanvas() {
    this.canvas.style.width = innerWidth + "px";
    this.canvas.style.height = innerHeight + "px";

    const width = parseInt(this.canvas.style.width, 10);
    const height = parseInt(this.canvas.style.height, 10);

    this.canvas.width = width * devicePixelRatio;
    this.canvas.height = height * devicePixelRatio;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawRect(rect) {
    switch (rect.type) {
      case "fill":
        this.ctx.fillStyle = rect.color;
        this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        break;
      case "stroke":
        this.ctx.strokeStyle = rect.color;
        this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  drawCrosshairs(x, y) {
    this.ctx.save();

    this.ctx.strokeStyle = "red";

    this.ctx.beginPath();
    this.ctx.moveTo(x, y - this.crossSize / 2);
    this.ctx.lineTo(x, y + this.crossSize / 2);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(x - this.crossSize / 2, y);
    this.ctx.lineTo(x + this.crossSize / 2, y);
    this.ctx.stroke();

    this.ctx.restore();
  }

  roll(theta, x, y) {
    this.ctx.translate(x, y);
    this.ctx.rotate(theta);
    this.ctx.translate(-x, -y);
  }
}
