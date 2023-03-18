import componentAABB      from './component-aabb.js'
import componentRigidBody from './component-rigid-body.js'
import componentTransform from './component-transform.js'
import { ECS, vec2 } from './deps.js'


export default function createHeroEntity (world, pos) {
    
    const HERO = ECS.createEntity(world)

    ECS.addComponentToEntity(world, HERO, 'hero')

    ECS.addComponentToEntity(world, HERO, 'rigidBody', componentRigidBody())

    ECS.addComponentToEntity(world, HERO, 'transform', componentTransform({ position: vec2.clone(pos) }))

    ECS.addComponentToEntity(
        world,
        HERO,
        'aabb',
        componentAABB({
            position: HERO.transform.position,  // passing position object links it to the aabb's object
            width: 30,  // humans perceive _slightly_ wider boxes as being more pleasant 🤷
            height: 29,
        })
    )

    return HERO
}
