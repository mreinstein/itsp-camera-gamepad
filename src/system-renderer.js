import globals from './globals.js'
import { ECS } from './deps.js'


const HERO_ENTITY_QUERY = [ 'hero' ]


// draw stuff to the screen every frame
export default function rendererSystem (world) {
    // @param Number dt milliseconds elapsed since last update frame
    const onUpdate = function (dt) {
        const { camera, canvas, ctx, world } = globals

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        //ctx.setTransform(1, 0, 0, 1, 0, 0)
        
        // postion "dummy" camera
        ctx.save()
        ctx.scale(camera.zoom, camera.zoom)
        ctx.translate(
            -camera.position[0] + (canvas.width / camera.zoom / 2),
            -camera.position[1] + (canvas.height / camera.zoom / 2)
        )
        
        // draw some non-collidable ground (just a simple bar to serve as some point of ref so we can see the hero move)
        ctx.fillStyle = '#333'
        ctx.fillRect(0, 320, 480, 20)

        // draw the hero object
        const hero = ECS.getEntities(world, HERO_ENTITY_QUERY)[0]
        ctx.fillStyle = '#333'
        ctx.fillRect(
            hero.aabb.position[0] - hero.aabb.width/2,
            hero.aabb.position[1] - hero.aabb.height/2,
            hero.aabb.width,
            hero.aabb.height
        )

        if (globals.cameraDebugDraw)
            renderDebugOverlays()

        ctx.restore()
    }

    return { onUpdate }
}


function renderDebugOverlays () {

    // TODO
    const { camera, canvas, ctx, world } = globals

    /*
    ctx.strokeStyle = '#0ff'
    ctx.strokeRect(
        desiredStickPosition.x - 3,
        desiredStickPosition.y - 3,
        6,
        6
    )
    

    // where the ship is at
    let radius = 30
    ctx.beginPath()
    ctx.arc(newCamPos.x, newCamPos.y, radius, 0, 2 * Math.PI, true)
    ctx.closePath()
    ctx.strokeStyle = '#000'
    ctx.stroke()

    
    // where the left stick is currently pointing
    radius = 10
    ctx.beginPath()
    ctx.arc(newCamPos.x + lStickX * 30,newCamPos.y + lStickY * 30, radius, 0, 2 * Math.PI, true)
    ctx.closePath()
    ctx.strokeStyle = '#ff0'
    ctx.stroke()

    // where the right stick is currently pointing
    radius = 10
    ctx.beginPath()
    ctx.arc(newCamPos.x + rStickX * 30, newCamPos.y + rStickY * 30, radius, 0, 2 * Math.PI, true)
    ctx.closePath()
    ctx.strokeStyle = '#f00'
    ctx.stroke()


    if (pointOfInterestPos) {
        ctx.strokeStyle = `rgb(${Math.round(0.5 * 255)}, ${Math.round(0.4 * 255)}, ${Math.round(0.2 * 255)})`
        ctx.strokeRect(
            pointOfInterestPos.x - 12,
            pointOfInterestPos.y - 12,
            24,
            24
        )

        ctx.strokeRect(
            newCamPos.x - 3,
            newCamPos.y - 3,
            6,
            6
        )

        ctx.strokeStyle = `rgb(${255 * 0.5}, ${255 * 0.4}, ${255 * 0.2})`
        ctx.beginPath()
        ctx.moveTo(newCamPos.x, newCamPos.y)
        ctx.lineTo(pointOfInterestPos.x, pointOfInterestPos.y)
        ctx.stroke()
    }

    
    ctx.strokeStyle = '#0f0'
    ctx.strokeRect(
        newCamPos.x + averageStick.x - 3,
        newCamPos.y + averageStick.y - 3,
        6,
        6
    )

    
    ctx.strokeStyle = 'rgb(128,128,0)'
    ctx.strokeRect(
        newCamPos.x + currRCamOffset.x - 3,
        newCamPos.y + currRCamOffset.y - 3,
        6,
        6
    )
    

    ctx.strokeStyle = '#ff0'
    ctx.strokeRect(
        smartCamPos.x - 12,
        smartCamPos.y  - 12,
        24,
        24
    )

    
    ctx.strokeStyle = '#f00'
    ctx.strokeRect(
        rSmartCamPos.x - 12,
        rSmartCamPos.y  - 12,
        24,
        24
    )
    */


    ctx.strokeStyle = '#333'

    for (const entity of ECS.getEntities(world, [ 'camera_poi' ])) {    
        ctx.setLineDash([12, 8])
        ctx.beginPath()
        ctx.arc(entity.transform.position[0], entity.transform.position[1], entity.camera_poi.innerRadius, 0, 2 * Math.PI, true)
        ctx.closePath()
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(entity.transform.position[0], entity.transform.position[1], entity.camera_poi.outerRadius, 0, 2 * Math.PI, true)
        ctx.closePath()
        ctx.stroke()
        
        ctx.setLineDash([])
    }
    
}




    