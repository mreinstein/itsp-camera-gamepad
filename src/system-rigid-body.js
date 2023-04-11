import constants           from './constants.js'
import globals             from './globals.js'
import { clamp, ECS, vec2} from './deps.js'


const RIGIDBODY_QUERY = [ 'rigidBody' ]


export default function rigidBodySystem (world) {

    // tmp variables we pre-allocate to avoid the dang garbage collector's wrath 👻
    const delta = vec2.create()


    // NOTE: this is not very good; when integrating physics it's better to have a fixed step
    // results in more stability and less numerical error. Since this is just a simple demo
    // we'll keep this simple and not deal with entity interpolation ;)
    const onUpdate = function (dt) {

        dt = dt / 1000 // convert ms to seconds

        for (const entity of ECS.getEntities(world, RIGIDBODY_QUERY)) {

            const dx = _stepX(entity, dt)
            const dy = _stepY(entity, dt)

            entity.rigidBody.velocity[0] = dx
            entity.rigidBody.velocity[1] = dy
            entity.transform.position[0] += (dx * dt)
            entity.transform.position[1] += (dy * dt)
        }
    }

    return { onUpdate }
}


// update entity's x velocity
// @param float dt seconds elapsed
function _stepX (entity, dt) {
    const { gamepad } = globals
    const wasleft = entity.rigidBody.velocity[0] < 0
    const wasright = entity.rigidBody.velocity[0] > 0
    const friction = 158.4905660377358 // entity.rigidBody.friction
    const accel = 220 * Math.abs(gamepad.lStickX)// entity.rigidBody.accel

    let ddx = 0
    let dx = entity.rigidBody.velocity[0]

    if (gamepad.lStickX < 0)
        ddx = ddx - accel
    else if (wasleft)
        ddx = ddx + friction

    if (gamepad.lStickX > 0)
        ddx = ddx + accel
    else if (wasright)
        ddx = ddx - friction

    const maxdx = 144 //entity.rigidBody.maxdx

    dx = clamp(dx + ddx * dt, -maxdx, maxdx)

    // clamp at zero to prevent friction from making us jiggle side to side
    if ((wasleft && dx > 0) || (wasright && dx < 0))
        return 0

    return dx
}


// get entity's y velocity
// @param float dt seconds elapsed
function _stepY (entity, dt) {
    const { gamepad } = globals
    const wasup = entity.rigidBody.velocity[1] < 0
    const wasdown = entity.rigidBody.velocity[1] > 0
    const friction = 158.4905660377358 // entity.rigidBody.friction
    const accel = 220 * Math.abs(gamepad.lStickY) // entity.rigidBody.accel

    let ddy = 0
    let dy = entity.rigidBody.velocity[1]

    if (gamepad.lStickY < 0)
        ddy = ddy - accel
    else if (wasup)
        ddy = ddy + friction

    if (gamepad.lStickY > 0)
        ddy = ddy + accel
    else if (wasdown)
        ddy = ddy - friction

    const maxdy = 144 //entity.rigidBody.maxdy

    dy = clamp(dy + ddy * dt, -maxdy, maxdy)

    // clamp at zero to prevent friction from making us jiggle side to side
    if ((wasup && dy > 0) || (wasdown && dy < 0))
        return 0

    return dy
}
