import { ECS, vec2 } from './deps.js'
import globals       from './globals.js'
import heroEntity    from './entity-hero.js'
import cameraSystem  from './system-camera.js'
import inputSystem   from './system-input.js'
import gfxSystem     from './system-renderer.js'
import phySystem     from './system-rigid-body.js'
import poiEntity     from './entity-poi.js'


function main () {
    init()

    // initialized, fade in
    document.querySelector('.curtain').style.backgroundColor = 'transparent'

    requestAnimationFrame(gameLoop)
}


function init () {
    const canvas = document.querySelector('canvas')
 
    const world = ECS.createWorld()    // generates a new entity component system

    // IMPORTANT! the order these systems are added matters, because it's the same order
    // it's onUpdate() functions run in.
    ECS.addSystem(world, inputSystem)
    ECS.addSystem(world, phySystem)
    ECS.addSystem(world, gfxSystem)
    ECS.addSystem(world, cameraSystem)

    globals.canvas = canvas
    globals.ctx = canvas.getContext('2d')
    globals.time.accumulator = 0
    globals.time.lastFrameTime = performance.now()
    globals.world = world

    vec2.set(globals.camera.position, 170, 210)

    heroEntity(world, [ 170, 210 ])

    //               pos            innerRadius  outerRadius
    poiEntity(world, [ 450, 250 ],  92,          512)

    const resize = function () {
        globals.canvas.width = window.innerWidth
        globals.canvas.height = window.innerHeight
        globals.canvas.style = `position: fixed; inset-inline-start: 0; inset-block-start: 0;`
    }

    window.addEventListener('resize', resize)
    resize()
}


function gameLoop () {
    const { time, world } = globals

    const newTime = performance.now()
    let frameTime = newTime - time.lastFrameTime
    time.lastFrameTime = newTime
    time.accumulator += frameTime

    // reset accumulator when > 2 seconds of time has elapsed since last step
    // e.g., when the game window is restored after being hidden for a while
    if (time.accumulator > 2000) {
        time.accumulator = 0
        frameTime = 0
    }

    ECS.update(world, frameTime)

    ECS.cleanup(world)

    requestAnimationFrame(gameLoop)
}


main()
