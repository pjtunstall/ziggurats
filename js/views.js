export class View {
  canvas;
  ctx;
  dpr;

  constructor() {
    this.dpr = devicePixelRatio;
    this.canvas = document.getElementById("canvas");
    this.setCanvasSize(this.canvas, innerWidth, innerHeight);
    this.ctx = this.canvas.getContext("2d");
    this.offscreen = new OffscreenCanvas(canvas.width, canvas.height);
    this.worker = new Worker("js/worker.js");
    this.worker.postMessage(
      { type: "init", canvas: this.offscreen, dpr: this.dpr },
      [this.offscreen]
    );
    this.worker.onmessage = (e) => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(e.data, 0, 0, this.canvas.width, this.canvas.height);
    };
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
}
