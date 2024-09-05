export class View {
  canvas;
  ctx;
  dpr;
  crossSize;
  midX;
  midY;
  targetXOfStaticImage;
  targetYOfStaticImage;
  drawingCanvas;
  drawingCtx;

  constructor() {
    this.dpr = devicePixelRatio;
    this.crossSize = 16 * this.dpr;
    this.canvas = document.getElementById("canvas");
    this.setCanvasSize(this.canvas, innerWidth, innerWidth);
    this.ctx = this.canvas.getContext("2d");
    this.drawCrosshairs();
    this.drawingCanvas = document.createElement("canvas");
    this.setCanvasSize(this.drawingCanvas, innerWidth, innerWidth);
    this.drawingCtx = this.drawingCanvas.getContext("2d");
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
    this.drawingCtx.clearRect(
      0,
      0,
      this.drawingCanvas.width,
      this.drawingCanvas.height
    );
  }

  fillRect(rect) {
    this.drawingCtx.fillStyle = rect.color;
    this.drawingCtx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  strokeRect(rect) {
    this.drawingCtx.strokeStyle = rect.color;
    this.drawingCtx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }

  copyRects() {
    this.ctx.drawImage(
      this.drawingCanvas,
      0,
      0,
      this.drawingCanvas.width,
      this.drawingCanvas.height
    );
  }

  copyCrosshairs() {
    this.ctx.drawImage(
      this.staticCanvas,
      this.midX - this.crossSize / 2,
      this.midY - this.crossSize / 2,
      this.crossSize,
      this.crossSize
    );
  }

  drawCrosshairs() {
    const midway = this.crossSize / 2;

    this.staticCanvas = document.createElement("canvas");
    this.setCanvasSize(this.staticCanvas, this.crossSize, this.crossSize);
    const ctx = this.staticCanvas.getContext("2d");

    ctx.strokeStyle = "red";

    ctx.beginPath();
    ctx.moveTo(midway, 0);
    ctx.lineTo(midway, this.crossSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, midway);
    ctx.lineTo(this.crossSize, midway);
    ctx.stroke();
  }

  roll(delta) {
    const x = this.midX;
    const y = this.midY;
    this.drawingCtx.translate(x, y);
    this.drawingCtx.rotate(delta);
    this.drawingCtx.translate(-x, -y);
  }
}
