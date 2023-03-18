import { vec2 } from './deps.js'


export default function componentAABB (obj) {
    return {
        position: obj.position || vec2.create(),
        width: obj.width,
        height: obj.height,
    }
}
