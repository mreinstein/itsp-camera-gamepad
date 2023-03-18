import { clamp, vec2 } from './deps.js'


const HALF_PI = Math.PI / 2


export function sinPlus (t) {
    return Math.sin(HALF_PI * t)
}


export function sinMinus (t) {
    return Math.sin(HALF_PI * (1-t))
}


export function easeOutBack (x) {
    const c1 = 1.70158
    const c3 = c1 + 1

    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}


export function easeOutSin (x) {
    return Math.sin((x * Math.PI) / 2)
}


// t: current time, b: begInnIng value, c: change In value, d: duration
export function easeInQuint (t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b
}


// t: current time, b: begInnIng value, c: change In value, d: duration
export function easeInQuad (t, b, c, d) {
    return c * (t /= d) * t + b
}


export function easeInCubic (x) {
    return x * x * x
}


export function easeOutQuart (x) {
    return 1 - Math.pow(1 - x, 4);
}


// interpolate x smoothly from 0 to 1
// from https://sol.gfxile.net/interpolation/index.html
export function smoothStep (x) {
    return x * x * (3 - 2 * x)
}


// from https://sol.gfxile.net/interpolation/index.html
//
// @param Object vec2 out resulting position
// @param Object vec2 v current position
// @param Object vec2 w goal position
// @param Integer N the slowdown factor. The higher it is, the slower v approaches w.
export function weightedAvg (out, v, w, N = 1) {
    //out = ((v * (N - 1)) + w) / N
    vec2.scale(out, v, N - 1)
    vec2.add(out, out, w)
    return vec2.scale(out, out, 1 / N)
}


// Gradually changes a value towards a desired goal over time.
// from https://stackoverflow.com/a/61372580/1927767
// @param Number dt seconds elapsed
export function smoothDamp (current, target, refs, smoothTime, maxSpeed=Infinity, dt=0.016) {
    // Based on Game Programming Gems 4 Chapter 1.10
    smoothTime = Math.max(0.0001, smoothTime)
    const omega = 2.0 / smoothTime

    const x = omega * dt
    const exp = 1.0 / (1.0 + x + 0.48 * x * x + 0.235 * x * x * x)
    let change = current - target
    const originalTo = target

    // Clamp maximum speed
    const maxChange = maxSpeed * smoothTime
    change = clamp(change, -maxChange, maxChange)
    target = current - change

    const temp = (refs.currentVelocity + omega * change) * dt
    refs.currentVelocity = (refs.currentVelocity - omega * temp) * exp
    let output = target + (change + temp) * exp

    // Prevent overshooting
    if (originalTo - current > 0.0 == output > originalTo) {
        output = originalTo
        refs.currentVelocity = (output - originalTo) / dt
    }

    return output
}


export function smoothDamp2 (current, targetIn, refs, smoothTime, maxSpeed=Infinity, dt=0.016) {
    // Based on Game Programming Gems 4 Chapter 1.10

    const target = vec2.clone(targetIn)

    smoothTime = Math.max(0.0001, smoothTime)
    const omega = 2.0 / smoothTime

    const x = omega * dt
    const exp = 1.0 / (1.0 + x + 0.48 * x * x + 0.235 * x * x * x)

    let change_x = current[0] - target[0];
    let change_y = current[1] - target[1];
    const originalTo = targetIn;

    // Clamp maximum speed
    const maxChange = maxSpeed * smoothTime;

    const maxChangeSq = maxChange * maxChange;
    const sqDist = change_x * change_x + change_y * change_y;
    if (sqDist > maxChangeSq) {
        const mag = Math.sqrt(sqDist);
        change_x = change_x / mag * maxChange;
        change_y = change_y / mag * maxChange;
    }

    target[0] = current[0] - change_x;
    target[1] = current[1] - change_y;

    const temp_x = (refs.currentVelocity[0] + omega * change_x) * dt;
    const temp_y = (refs.currentVelocity[1] + omega * change_y) * dt;

    refs.currentVelocity[0] = (refs.currentVelocity[0] - omega * temp_x) * exp;
    refs.currentVelocity[1] = (refs.currentVelocity[1] - omega * temp_y) * exp;

    let output_x = target[0] + (change_x + temp_x) * exp;
    let output_y = target[1] + (change_y + temp_y) * exp;

    // Prevent overshooting
    const origMinusCurrent_x = originalTo[0] - current[0];
    const origMinusCurrent_y = originalTo[1] - current[1];
    const outMinusOrig_x = output_x - originalTo[0];
    const outMinusOrig_y = output_y - originalTo[1];

    if (origMinusCurrent_x * outMinusOrig_x + origMinusCurrent_y * outMinusOrig_y > 0) {
        output_x = originalTo[0];
        output_y = originalTo[1];

        refs.currentVelocity[0] = (output_x - originalTo[0]) / dt;
        refs.currentVelocity[1] = (output_y - originalTo[1]) / dt;
    }

    return vec2.fromValues(output_x, output_y);
}
