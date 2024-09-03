# Ziggurats

[1. Intention](#1-intention)

[2. Instructions](#2-instructions)

[3. Performance](#3-performance)

[4. Questions](#4-questions)

[5. Further ](#5-further)

## 1. Intention

[Ziggurats](https://ziggurats.netlify.app/) is a little exercise I came up with to help me learn about the Canvas API and MVC architecture.

## 2. Instructions

Arrow keys to pitch and yaw, Z and X to roll. Tab and Q to adjust speed. Click to spawn rectangles from an arbitrary point. Space to reset.

## 3. Performance

At present, I'm keeping track of active rectangles by pushing newly spawned ones to an array, then slicing it to remove old ones.

```javascript
this.model.spawnRect(); // this.rects.push(new Rect(this.midX, this.midY, this.start));
for (let i = 0; i < this.model.rects.length; i++) {
  const rect = this.model.rects[i];
  this.zoom(rect);
  this.view.drawRect(rect);
}
if (this.model.rects.length > 255) {
  this.model.rects = this.model.rects.slice(1);
}
```

I was suprised to see that this naive approach was actually more performant than my attempt at keeping a pool of rectangle objects, marked as active or inactive, only drawing and zooming the active ones, and pushing a new one only if there isn't an inactive rectangle that can be reactivated. It seems any benefit from the pool was outweighed by the cost of the extra loop to check for inactive rectangles and/or the extra condition to only zoom and draw active rectangles.

On the other hand, unrolling loops to take advantage of instruction-level parallelism can improve performance. Run `node benchmarks/translate_benchmark.js` to compare the naive version of `controller.translate` with three other versions unrolled to execute, respectively, two, four, and eight lines per iteration.

```javascript
translate(axis, sign, distance) { // naive
  for (const rect of this.model.rects) {
    rect[axis] -= sign * distance;
  }
}
```

```javascript
translate(axis, sign, distance) { // unrolled
  let k;
  const difference = -sign * distance;
  for (let i = 0; i < Math.floor(rects.length / 8); i++) {
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
```

The benchmark populates an array with the maximum number, 256, of rectangle objects then compares all four functions over ten million trials each. The results that follow are typical. The order can vary, but the higher-numbered unrolls tend to be faster.

```
naive: 7743
unrolled2: 6511
unrolled4: 5021
unrolled8: 4398
unrolled2 is 1.1892182460451544 times faster than naive.
unrolled4 is 1.542123083051185 times faster than naive.
unrolled8 is 1.7605729877216916 times faster than naive.
```

On the basis of this, I also replaced the following simple loop in `controller.loop` with an eightfold unrolled one.

```javascript
for (let i = 0; i < this.model.rects.length; i++) {
  const rect = this.model.rects[i];
  this.zoom(rect);
  this.view.drawRect(rect);
}
```

## 4. Questions

My instinct was to pass just the necessary values from `controller` to `view` in `this.view.drawCrosshairs(this.model.midX, this.model.midY);`, but there was a suggestion that it might be more in keeping with MVC philosophy to pass `model` and let `view` extract the values it needs. I've followed my original idea for now, considering that the controller is supposed to mediate between the others, but I'd be curious to hear arguments either way.

At one time, I tried adding this laser effect, called at the end of `controller.loop`. The lines were visible, but the blur was hidden by `clearCanvas` or, without `clearCanvas`, by the rectangles as they expanded to fill the screen, even though `drawFire` was called afterwards. Why?

```javascript
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
```

If you want to experiment, I was triggering the lasers with spacebar, using the following extra case in `controller.handleKeydown`, which requires the named extra fields `isFire` and `isFireDElay` in `model`, both initialized to `false`.

```javascript
case " ":
  if (!this.model.isFireDelay) {
    this.model.isFire = true;
    this.model.isFireDelay = true;
    setTimeout(() => {
      this.model.isFire = false;
      setTimeout(() => {
        this.model.isFireDelay = false;
      }, 222);
    }, 100);
  }
```

`controller.loop` ended with

```javascript
if (this.model.isFire) {
  this.view.drawFire(this.model);
}
```

directly after the lines dealing with the crosshairs. Note that this was before I implemented the roll motion and so not designed with that in mind.
