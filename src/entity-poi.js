import componentTransform from './component-transform.js'
import { ECS, vec2 }      from './deps.js'


export default function createPointOfInterestEntity (world, pos, innerRadius=80, outerRadius=250) {
    
    const POI = ECS.createEntity(world)

    ECS.addComponentToEntity(world, POI, 'transform', componentTransform({ position: vec2.clone(pos) }))

    ECS.addComponentToEntity(world, POI, 'camera_poi', {
        innerRadius,
        outerRadius
    })

    return POI
}
