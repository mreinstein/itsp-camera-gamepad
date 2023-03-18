import { vec2 } from './deps.js'


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
