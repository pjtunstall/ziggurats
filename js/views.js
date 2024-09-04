export class View {
  canvas;
  ctx;
  crossSize;
  dpr;

  constructor() {
    this.dpr = devicePixelRatio;
    this.canvas = document.getElementById("canvas");
    this.setCanvasSize(this.canvas, innerWidth, innerHeight);
    // this.canvas.style.position = "absolute";
    // this.canvas.style.top = (innerHeight - innerWidth) / 2;
    this.ctx = this.canvas.getContext("2d");
    this.crossSize = 16 * this.dpr;
    this.drawCrosshairs(
      (this.dpr * innerWidth) / 2,
      (this.dpr * innerHeight) / 2
    );
  }

  addEventListener(eventType, handler) {
    addEventListener(eventType, (event) => {
      switch (eventType) {
        case "resize":
          handler();
        case "keydown":
          if (event.code === "Tab") {
            event.preventDefault();
          }
          handler(event.code);
        case "keyup":
          handler(event.code);
          break;
        case "click":
          handler(event.clientX, event.clientY);
          break;
        default:
          handler(event);
      }
    });
  }

  // "For optimum image quality, you should not use the `width` and `height` attributes to set the on-screen size of the canvas. Instead, set the desired on-screen CSS pixel size of the canvas with CSS `width` and `height` style attributes. Then, before you begin drawing in your JavaScript code, set the `width` and `height` properties of the canvas object to the number of CSS pixels times devicePixelRatio." - David Flanagan: JavaScript the Definitive Guide, p. 489, Section 15.8.2.
  setCanvasSize(canvas, width, height) {
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width * this.dpr;
    canvas.height = height * this.dpr;
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

  copyCrosshairs() {
    this.ctx.drawImage(this.staticCanvas, 0, 0, innerWidth, innerWidth);
  }

  drawCrosshairs(x, y) {
    this.staticCanvas = document.createElement("canvas");
    this.setCanvasSize(this.staticCanvas, innerWidth, innerWidth);
    const ctx = this.staticCanvas.getContext("2d");

    ctx.strokeStyle = "red";

    ctx.beginPath();
    ctx.moveTo(x, y - this.crossSize / 2);
    ctx.lineTo(x, y + this.crossSize / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - this.crossSize / 2, y);
    ctx.lineTo(x + this.crossSize / 2, y);
    ctx.stroke();
  }

  roll(theta, x, y) {
    this.ctx.translate(x, y);
    this.ctx.rotate(theta);
    this.ctx.translate(-x, -y);
  }
}
