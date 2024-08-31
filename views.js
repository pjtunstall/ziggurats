export class View {
  ctx;
  crossSize;
  canvas;

  constructor(canvas) {
    this.crossSize = 10;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
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

  drawCrosshairs(model) {
    const x = model.midX;
    const y = model.midY;

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

  drawFire(model) {
    const x = model.midX;
    const y = model.midY;

    this.ctx.save();

    this.ctx.strokeStyle = "red";
    this.ctx.shadowBlur = 16;
    this.ctx.shadowColor = "rgba(255, 0, 0, 0.5)";
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width, this.canvas.height);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.ctx.restore();
  }
}
