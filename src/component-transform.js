import { vec2 } from './deps.js'


export default function componentTransform (obj) {
    return {
        position: obj.position || vec2.create(),
        rotation: obj.rotation || 0,

        // if set, this means the position is relative to another transform
        // rather than being in world space.
        // relativeTo is an ECS entity
        relativeTo: obj.relativeTo,
    }
}
