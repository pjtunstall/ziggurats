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
    this.rects = [];
  }
}
