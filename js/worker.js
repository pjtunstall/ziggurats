let offscreen;
let ctx;
let midX;
let midY;
let rects = [];
let lastTimestamp = 0;
let start = Date.now();
let loopId;
let speed = 0.05;
let omega = 4; // pitch and yaw speed in px
let theta = 0; // total roll in radians
let crossSize;
let midway;
let targetXOfStaticImage;
let targetYOfStaticImage;
let staticCanvas;

onmessage = function (e) {
  switch (e.data.type) {
    case "init":
      offscreen = e.data.canvas;
      ctx = offscreen.getContext("2d");
      dpr = e.data.dpr;
      crossSize = 16 * dpr;
      midway = crossSize / 2;
      staticCanvas = new OffscreenCanvas(crossSize, crossSize);
      midX = offscreen.width / 2;
      midY = offscreen.height / 2;
      targetXOfStaticImage = midX - midway;
      targetYOfStaticImage = midY - midway;
      rects.length = 0;
      drawCrosshairs();
      loopId = requestAnimationFrame(loop);
      break;
    case "roll":
      const delta = e.data.clockwise ? Math.PI / 64 : -Math.PI / 64;
      roll(delta);
      break;
    case "translate":
      translate(e.data.axis, e.data.sign, e.data.distance);
      break;
    case "speed":
      speed = e.data.speed;
      break;
    case "click":
      roll(-theta);
      const deltaX = e.data.x - midX;
      const deltaY = e.data.y - midY;
      translate("x", 1, -deltaX);
      translate("y", 1, -deltaY);
      roll(theta);
      break;
  }
};

function translate(axis, sign, distance) {
  let k;
  const difference = -sign * distance;
  for (let i = 0; i < Math.floor(rects.length / 8); i++) {
    k = 8 * i;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k][axis] += difference;
  }
  for (let i = 1; i <= rects.length % 8; i++) {
    rects[rects.length - i][axis] += difference;
  }
}

function roll(delta) {
  ctx.translate(midX, midY);
  ctx.rotate(delta);
  theta += delta;
  ctx.translate(-midX, -midY);
}

class Rect {
  x;
  y;
  width;
  height;
  color;
  type;
  dob;

  constructor() {
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
  }
}

function zoom(rect) {
  const widthIncrease = rect.width * speed;
  const heightIncrease = rect.height * speed;

  rect.width += widthIncrease;
  rect.height += heightIncrease;

  rect.x -= widthIncrease / 2;
  rect.y -= heightIncrease / 2;
}

function drawRect(rect) {
  switch (rect.type) {
    case "fill":
      ctx.fillStyle = rect.color;
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      break;
    case "stroke":
      ctx.strokeStyle = rect.color;
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }
}

function drawRects() {
  let k;
  for (let i = 0; i < Math.floor(rects.length / 8); i++) {
    k = 8 * i;
    drawRect(rects[k++]);
    drawRect(rects[k++]);
    drawRect(rects[k++]);
    drawRect(rects[k++]);
    drawRect(rects[k++]);
    drawRect(rects[k++]);
    drawRect(rects[k++]);
    drawRect(rects[k]);
  }
  for (let i = 1; i <= rects.length % 8; i++) {
    drawRect(rects[rects.length - i]);
  }
}

function loop(timestamp) {
  requestAnimationFrame(loop);

  drawRects();
  copyCrosshairs();

  if (timestamp - lastTimestamp < 16) {
    const bitmap = offscreen.transferToImageBitmap();
    postMessage(bitmap);
    return;
  }
  lastTimestamp = timestamp;

  rects.push(new Rect());

  let k;
  for (let i = 0; i < Math.floor(rects.length / 8); i++) {
    k = 8 * i;
    zoom(rects[k++]);
    zoom(rects[k++]);
    zoom(rects[k++]);
    zoom(rects[k++]);
    zoom(rects[k++]);
    zoom(rects[k++]);
    zoom(rects[k++]);
    zoom(rects[k]);
  }
  for (let i = 1; i <= rects.length % 8; i++) {
    zoom(rects[rects.length - i]);
  }

  if (rects.length > 255) {
    rects.shift();
  }

  const bitmap = offscreen.transferToImageBitmap();
  postMessage(bitmap);
}

function drawCrosshairs() {
  const ctx = staticCanvas.getContext("2d");

  ctx.strokeStyle = "red";

  ctx.beginPath();
  ctx.moveTo(midway, 0);
  ctx.lineTo(midway, crossSize);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, midway);
  ctx.lineTo(crossSize, midway);
  ctx.stroke();
}

function copyCrosshairs() {
  ctx.drawImage(
    staticCanvas,
    targetXOfStaticImage,
    targetYOfStaticImage,
    crossSize,
    crossSize
  );
}
