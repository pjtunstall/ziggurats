export class Model {
  speed;
  slow;
  normal;
  fast;
  omega; // pitch and yaw speed in px
  rAFForInputs;

  constructor() {
    this.speed = 0.1;
    this.slow = 0.05;
    this.normal = 0.1;
    this.fast = 0.2;
    this.omega = 4;
  }
}
