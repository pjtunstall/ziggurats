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

function ilpTranslate(axis, sign, distance) {
  for (let i = 0; i < Math.floor(rects.length / 4); i++) {
    rects[4 * i][axis] -= sign * distance;
    rects[4 * i + 1][axis] -= sign * distance;
    rects[4 * i + 2][axis] -= sign * distance;
    rects[4 * i + 3][axis] -= sign * distance;
  }
  for (let i = 0; i < rects.length % 4; i++) {
    rects[rects.length - 1 - i][axis] -= sign * distance;
  }
}

function naiveTranslate(axis, sign, distance) {
  for (const rect of rects) {
    rect[axis] -= sign * distance;
  }
}

let start = Date.now();
for (let i = 0; i < 10_000_000; i++) {
  ilpTranslate("x", -1, 8);
}
const ilp = Date.now() - start;

start = Date.now();
for (let i = 0; i < 10_000_000; i++) {
  naiveTranslate("x", -1, 8);
}
const naive = Date.now() - start;

console.log("naive:", naive);
console.log("ilp:", ilp);

let winner;
let loser;
let ratio;
if (ilp < naive) {
  winner = "ilp";
  loser = "naive";
  ratio = naive / ilp;
} else {
  winner = "naive";
  loser = "ilp";
  ratio = ilp / naive;
}

console.log(`${winner} is ${ratio} times faster than ${loser}.`);
