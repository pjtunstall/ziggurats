let rects = [];
for (let i = 0; i < 256; i++) {
  rects.push({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    color: "rgb(0, 0, 0)",
    type: "fill",
  });
}

function unrolled2Translate(axis, sign, distance) {
  let k;
  const difference = -sign * distance;
  for (let i = 0; i < Math.floor(rects.length / 2); i++) {
    k = 2 * i;
    rects[k++][axis] += difference;
    rects[k][axis] += difference;
  }
  for (let i = 1; i <= rects.length % 2; i++) {
    rects[rects.length - i][axis] += difference;
  }
}

function unrolled4Translate(axis, sign, distance) {
  let k;
  const difference = -sign * distance;
  for (let i = 0; i < Math.floor(rects.length / 4); i++) {
    k = 4 * i;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k++][axis] += difference;
    rects[k][axis] += difference;
  }
  for (let i = 1; i <= rects.length % 4; i++) {
    rects[rects.length - i][axis] += difference;
  }
}

function unrolled8translate(axis, sign, distance) {
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

function naiveTranslate(axis, sign, distance) {
  for (const rect of rects) {
    rect[axis] -= sign * distance;
  }
}

let start = Date.now();
for (let i = 0; i < 10_000_000; i++) {
  unrolled2Translate("x", -1, 8);
}
const unrolled2 = Date.now() - start;

start = Date.now();
for (let i = 0; i < 10_000_000; i++) {
  unrolled4Translate("x", -1, 8);
}
const unrolled4 = Date.now() - start;

start = Date.now();
for (let i = 0; i < 10_000_000; i++) {
  unrolled8translate("x", -1, 8);
}
const unrolled8 = Date.now() - start;

start = Date.now();
for (let i = 0; i < 10_000_000; i++) {
  naiveTranslate("x", -1, 8);
}
const naive = Date.now() - start;

console.log("naive:", naive);
console.log("unrolled2:", unrolled2);
console.log("unrolled4:", unrolled4);
console.log("unrolled8:", unrolled8);

if (unrolled2 < naive) {
  console.log(`unrolled2 is ${naive / unrolled2} times faster than naive.`);
} else {
  console.log(`naive is ${unrolled2 / naive} times faster than unrolled2.`);
}

if (unrolled4 < naive) {
  console.log(`unrolled4 is ${naive / unrolled4} times faster than naive.`);
} else {
  console.log(`naive is ${unrolled4 / naive} times faster than unrolled4.`);
}

if (unrolled8 < naive) {
  console.log(`unrolled8 is ${naive / unrolled8} times faster than naive.`);
} else {
  console.log(`naive is ${unrolled8 / naive} times faster than unrolled4.`);
}
