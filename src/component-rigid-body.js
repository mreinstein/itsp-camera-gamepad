import constants from './constants.js'


const { METER, ACCEL, FRICTION, MAXSPEED } = constants


export default function componentRigidBody (obj = {}) {
    const maxSpeed = METER * (obj.maxSpeed ?? MAXSPEED)
    const accel = maxSpeed / (obj.accel ?? ACCEL)
    const friction = maxSpeed / (obj.friction ?? FRICTION)

    return {
        velocity: [ 0, 0 ],
        maxSpeed,
        accel,
        friction
    }
}
