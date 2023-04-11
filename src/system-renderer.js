import globals from './globals.js'
import { ECS } from './deps.js'


const HERO_ENTITY_QUERY = [ 'hero' ]
const CAMERA_POI_QUERY = [ 'camera_poi' ]


// draw stuff to the screen every frame
export default function rendererSystem (world) {
    // @param Number dt milliseconds elapsed since last update frame
    const onUpdate = function (dt) {
        const { camera, canvas, ctx, world } = globals

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
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

        if (globals.cameraDebugDraw) {   
            ctx.strokeStyle = '#333'

            for (const entity of ECS.getEntities(world, CAMERA_POI_QUERY)) {    
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

        ctx.restore()
    }

    return { onUpdate }
}
    