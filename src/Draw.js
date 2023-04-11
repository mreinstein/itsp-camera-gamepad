import { round } from './deps.js'


export function box (context, pos, width, height, color='#fff') {
    context.strokeStyle = color
    context.strokeRect(
        round(pos[0] - length / 2),
        round(pos[1] - length / 2),
        width,
        height
    )
}


export function square (context, pos, length, color='#fff') {
    context.strokeStyle = color
    context.strokeRect(
        round(pos[0] - length / 2),
        round(pos[1] - length / 2),
        length,
        length
    )
}


export function circle (context, pos, radius, color='#fff') {
    context.beginPath()
    context.arc(round(pos[0]), round(pos[1]), radius, 0, 2 * Math.PI, true)
    context.closePath()
    context.strokeStyle = color
    context.stroke()
}


export function line (context, p0, p1, color='#fff') {
    context.strokeStyle = color
    context.beginPath()
    context.moveTo(p0[0], p0[1])
    context.lineTo(p1[0], p1[1])
    context.stroke()
}
