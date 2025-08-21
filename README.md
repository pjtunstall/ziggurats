# Ziggurats

[1. Intention](#1-intention)

[2. Instructions](#2-instructions)

[3. Performance](#3-performance)

- [Object pool](#object-pool)
- [Seperate arrays for each type of rectangle](#seperate-arrays-for-each-type-of-rectangle)
- [Loop unrolling](#loop-unrolling)
- [Controlling the time step](#controlling-the-time-step)
- [Worker thread and roll](#worker-thread-and-roll)

[4. Questions](#4-questions)

- [Central controller versus linear flow](#central-controller-versus-linear-flow)
- [Encapsulation versus principle of least privilege](#encapsulation-versus-principle-of-least-privilege)
- [Blur](#blur)

## 1. Intention

[Ziggurats](https://ziggurats.netlify.app/) is an exercise I came up with to help me learn about the Canvas API and MVC architecture. It's my first attempt at writing something in this style. I took inspiration from the [TodoMVC](https://todomvc.com/) ES6 example. My aim was to imitate it to understand it better rather than because I thought it was particularly appropriate to this use case.

It also turned into an exploration of some performance considerations.

## 2. Instructions

Arrow keys to pitch and yaw, Z and X to roll. W and S to adjust speed. Click to spawn rectangles from an arbitrary point. Space to reset.

## 3. Performance

### Object pool

At present, I'm storing active rectangles in an array. Each frame, I spawn a new rectangle, pushing it to the array. If the array then contains more than 255 rectangles, I shift it to remove the first.

```javascript
rects.push(new Rect());

// ...

if (rects.length > 255) {
  rects.shift();
}
```

I was suprised to see that this naive approach was actually more performant than my attempt at keeping a pool of rectangle objects. I marked them as active or inactive, only drawing and zooming the active ones, and pushing a new one only if there wasn't an inactive rectangle that could be reactivated. Apparently, any benefit from the pool was outweighed by the cost of the extra loop to check for inactive rectangles and/or the extra condition to only zoom and draw active rectangles.

### Separate arrays for each type of rectangle

In another failed attempt at optimization, I tried using separate arrays for the two types of rectangle, fill (solid rectangles) and stroke (outlines). The idea was that I could draw all rectangles of a particular type together to save switching back and forth between drawing styles. In practice, it didn't seem to help performance, and I lost the nice effect of the two types being irregularly interleaved.

### Loop unrolling

On the other hand, unrolling loops to take advantage of instruction-level parallelism did improve performance. I learn this idea from Casey Muratori's course [Performance Aware Programming](https://www.computerenhance.com/p/table-of-contents). Run `node benchmarks/translate_benchmark.js` to compare the naive version of `controller.translate` with four other versions unrolled to pack, respectively, 2, 4, 8, and 16 naive iterations into one.

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
  for (let i = 0; i < Math.floor(rects.length / 16); i++) {
    k = 16 * i;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k][axis] += difference;
  }
  for (let i = 1; i <= rects.length % 16; i++) {
    rects[rects.length - i][axis] += difference;
  }
}
```

The benchmark populates an array with the maximum number, 256, of rectangle objects then compares all four functions over ten million trials each. The results that follow are typical. The order can vary, and unrolled2 is frequently slower than naive, but, on the whole, the higher-numbered unrolls tend to be faster, up to 16, at least.

```
naive: 5611.487759
unrolled2: 5506.649566
unrolled4: 4699.428148999999
unrolled8: 4221.712463
unrolled16: 4080.0745829999996
unrolled2 is 1.0190384718953804 times faster than naive.
unrolled4 is 1.194078849826458 times faster than naive.
unrolled8 is 1.3291970517130882 times faster than naive.
unrolled16 is 1.3753395054053108 times faster than naive.
```

On the basis of such results, I also replaced the following simple loop with an unrolled one, although later I split it into two unrolled loops so that logic updates could be separated from rendering, in order to prevent the logic updates from happening faster on computers with a refresh rate greater than 60Hz.

```javascript
rects.forEach((rect) => {
  zoom(rect);
  drawRect(rect);
});
```

The current versions of these loops are to be found in `worker.js`.

### Controlling the time step

Another thing that puzzled me: according to the frame-rate display in Chrome (frame rendering stats), any condition for controlling the time step that was actually likely to be triggered by fluctuations in frame rate resulted in a drastic decline in performance, but without any noticeable jank. For example, when I had a `requestAnimationFrame` callback in `controller`:

```javascript
if (timestamp - this.lastTimestamp < 16.667) {
  return;
}
this.lastTimestamp = timestamp;
```

There seemed to be no problem with lower numbers. Higher values (including much higher values), for which the condition was likely to evaluate to true very often, had a similar effect.

My theory now is that this is due to how Chrome measures frame drops. If the animation doesn't happen as scheduled by `requestAnimationFrame`, I'm guessing that counts as a frame drop. I didn't notice such a phenomenon in our [space invaders game](https://github.com/pjtunstall/retro-raiders), and there it was only the logic update that was being skipped; the rendering was always allowed. Indeed, on the present project, when I separated logic from rendering and made sure to never skip the rendering, Chrome's "frame rendering stats" were happy.

### Worker thread and roll

Before adding a a worker thread for double buffering, I was finding that any non-zero degree of roll, even if left unchanging, had an adverse effect on performance. (I'm implementing roll by rotating the coordinate system of the offscreen canvas where the rectangles are drawn before being copied to the main canvas.) Since adding the worker, degree of roll no longer had a noticeable effect for me under normal conditions.

## 4. Questions

### Central controller versus linear flow

In my interpretation of MVC, the controller calls methods of the other two components. But I've also seen examples where it's the view that calls methods of the controller, which calls methods of the model. I wonder what the pros and cons of each design are: central controller or linear flow. Most of the advice I'm getting is to have the controller alone call other components.

### Encapsulation versus principle of least privilege

My instinct was to pass just the necessary values from `controller` to `view` in `this.view.drawCrosshairs(this.model.midX, this.model.midY);` (before I moved drawing to a worker thread), but there was a suggestion that it might be more in keeping with MVC philosophy to pass `model` and let `view` extract the values it needs. I've followed my original idea for now, considering that the controller is supposed to mediate between the others, but I'd be curious to hear arguments either way. (This was before moving the drawing to a web worker, when it was all done directly in `view`.)

### Blur

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

directly after the lines dealing with the crosshairs. Note that this was before I implemented the roll motion or adding the worker thread, and so would need adapting to the current way of doing things.
