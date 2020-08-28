/*
 * https://codepen.io/milesmanners/pen/EXGByv?page=49&q=Noisy
 * example:
 * var customTween = createStepEasing(3, TWEEN.Easing.Exponential.InOut);
 */

function threeStepEasing(k: number) {
    return Math.floor(k * 3) / 3;
}

function createStepFunction(numSteps: number) {
    return (k: number) => ~~(k * numSteps) / numSteps;
}
function createStepEasing(numSteps: number, easeFn: any) {
    return (k: number) => {
        let d = k * numSteps,
            fd = ~~d;
        return (easeFn(d - fd) + fd) / numSteps;
    };
}
function createNoisyEasing(randomProportion: number, easingFunction: any) {
    let normalProportion = 1.0 - randomProportion;
    return (k: number) =>
        randomProportion * Math.random() + normalProportion * easingFunction(k);
}

export { createNoisyEasing, createStepEasing };
