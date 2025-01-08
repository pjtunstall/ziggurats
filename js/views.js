export class View {
  canvas;
  offscreen;
  worker;

  constructor() {
    this.canvas = document.createElement("canvas");
    document.body.append(this.canvas);
    this.offscreen = this.canvas.transferControlToOffscreen();
    this.worker = new Worker("js/worker.js");
    this.worker.postMessage(
      { type: "init", canvas: this.offscreen, dpr: devicePixelRatio },
      [this.offscreen]
    );
    this.setCanvasSize(innerWidth, innerHeight);
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
  setCanvasSize(width, height) {
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.worker.postMessage({ type: "resize", width, height });
  }
}
