/*
* https://codepen.io/milesmanners/pen/EXGByv?page=49&q=Noisy
* example: 
* var customTween = createStepEasing(3, TWEEN.Easing.Exponential.InOut);
*/

function threeStepEasing(k) {
  return Math.floor(k * 3) / 3;
}

function createStepFunction(numSteps) {
  return k => ~~(k * numSteps) / numSteps;
}
function createStepEasing(numSteps, easeFn) {
  return k => { let d = k*numSteps, fd = ~~d; return (easeFn(d - fd) + fd) / numSteps; };
}
function createNoisyEasing (randomProportion, easingFunction) {
  let normalProportion = 1.0 - randomProportion;
  return k => randomProportion * Math.random() + normalProportion * easingFunction(k);
}

export { createNoisyEasing, createStepEasing };