export class Model {
  speed;
  slow;
  normal;
  fast;
  omega; // angular speed in px
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
    this.midX = innerWidth / 2;
    this.midY = innerHeight / 2;
    this.start = Date.now();
    this.rects = [];
  }

  spawnRect() {
    this.rects.push(new Rect(this.midX, this.midY, this.start));
  }
}

class Rect {
  x;
  y;
  width;
  height;
  color;
  type;
  dob;
  active;

  constructor(midX, midY, start) {
    {
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
      const type = Math.random() < 0.3 ? "fill" : "stroke";

      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.type = type;
      this.dob = dob;
      this.active = true;
    }
  }
}
