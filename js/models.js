export class Model {
  speed;
  slow;
  normal;
  fast;
  omega; // pitch and yaw speed in px
  theta; // total roll in radians
  midX;
  midY;
  start;
  rects;

  constructor() {
    this.speed = 0.05;
    this.slow = 0.02;
    this.normal = 0.05;
    this.fast = 0.1;
    this.omega = 4;
    this.theta = 0;
    this.start = Date.now();
    this.rects = [[], []];
  }

  spawnRect() {
    if (Math.random() < 0.3) {
      // fill
      this.rects[0].push(new Rect(this.midX, this.midY, this.start));
    } else {
      // stroke
      this.rects[1].push(new Rect(this.midX, this.midY, this.start));
    }
  }
}

class Rect {
  x;
  y;
  width;
  height;
  color;
  dob;

  constructor(midX, midY, start) {
    const width = Math.random();
    const height = Math.random();
    const x = midX - width / 2;
    const y = midY - height / 2;
    let p = Math.random() * 255;
    let q = Math.random() * 255;
    let r;
    const dob = Date.now();
    r =
      dob % 30000 < 10000
        ? Math.round(Math.random()) * 255
        : Math.random() * 255;
    const color =
      (dob - start) % 70000 < 60000
        ? `rgb(${r} ${r} ${r})`
        : `rgb(${p} ${q} ${r})`;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.dob = dob;
  }
}
