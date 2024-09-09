let results = {};

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

function unrolled16translate(axis, sign, distance) {
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

function naiveTranslate(axis, sign, distance) {
  for (const rect of rects) {
    rect[axis] -= sign * distance;
  }
}

let start = performance.now();
for (let i = 0; i < 10_000_000; i++) {
  unrolled2Translate("x", -1, 8);
}
results.unrolled2 = performance.now() - start;

start = performance.now();
for (let i = 0; i < 10_000_000; i++) {
  unrolled4Translate("x", -1, 8);
}
results.unrolled4 = performance.now() - start;

start = performance.now();
for (let i = 0; i < 10_000_000; i++) {
  unrolled8translate("x", -1, 8);
}
results.unrolled8 = performance.now() - start;

start = performance.now();
for (let i = 0; i < 10_000_000; i++) {
  unrolled16translate("x", -1, 8);
}
results.unrolled16 = performance.now() - start;

start = performance.now();
for (let i = 0; i < 10_000_000; i++) {
  naiveTranslate("x", -1, 8);
}
results.naive = performance.now() - start;

resultsArray = Object.entries(results).sort((a, b) => b[1] - a[1]);

resultsArray.forEach(([key, value]) => {
  console.log(`${key}:`, value);
});

resultsArray.forEach(([key, value]) => {
  if (key === "naive") {
    return;
  }
  const naiveValue = results.naive;
  if (value < naiveValue) {
    console.log(`${key} is ${naiveValue / value} times faster than naive.`);
  } else {
    console.log(`naive is ${value / naiveValue} times faster than ${key}.`);
  }
});
