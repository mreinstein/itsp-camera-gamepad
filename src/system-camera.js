import globals           from './globals.js'
import updateSmartCamera from './update-smart-camera.js'
import { smoothStep }    from './easings.js'
import { ECS, vec2 }     from './deps.js'


const { currCameraTarget } = globals.scriptEnv


// invoke Ryan's updateSmartCamera script and set up the external variables it relies on to work
export default function cameraSystem (world) {
	// @param Number dt milliseconds elapsed since last update frame
	const onUpdate = function (dt) {

		const hero = ECS.getEntities(world, [ 'hero' ])[0]

		currCameraTarget.setVelocity(hero.rigidBody.velocity[0],hero.rigidBody.velocity[1]) 
	    
	    currCameraTarget.setPosition(hero.aabb.position[0], hero.aabb.position[1])
	    currCameraTarget.lStickX = globals.gamepad.lStickX
	    currCameraTarget.lStickY = globals.gamepad.lStickY
	    currCameraTarget.rStickX = globals.gamepad.rStickX
	    currCameraTarget.rStickY = globals.gamepad.rStickY

	    // add/remove the camera attractors depending on their distance from the camera target (hero)
	    for (const entity of ECS.getEntities(world, [ 'camera_poi' ])) { 
		    const d = vec2.distance(entity.transform.position, hero.aabb.position)

		    const iswithinRange = d <= entity.camera_poi.outerRadius

		    if (iswithinRange) {
		        if (!currCameraTarget.pointsOfInterest.length) {
		             currCameraTarget.pointsOfInterest.push({
		                pos: vec2.clone(entity.transform.position),
		                cameraInfluence: 0,
		                enabled: true,
		                targetZoom: -1, // A zoom value of -1 means it is not set
		                percentageZoom: 0
		             })
		        }

		        if (d <= entity.camera_poi.innerRadius) {
		            currCameraTarget.pointsOfInterest[0].cameraInfluence = 0
		        } else if (d <= entity.camera_poi.outerRadius) {
		            const ringWidth = entity.camera_poi.outerRadius - entity.camera_poi.innerRadius
		            currCameraTarget.pointsOfInterest[0].cameraInfluence = 1 - smoothStep((d - entity.camera_poi.innerRadius) / ringWidth)
		        }
		        
		    } else if (currCameraTarget.pointsOfInterest.length) {
		        currCameraTarget.pointsOfInterest.length = 0
		    }
	    }

		updateSmartCamera()

		// at this point, dummyCameraTarget has been updated with the exact location to place the camera
		vec2.copy(globals.camera.position, globals.scriptEnv.dummyCameraTarget.getPosition())
	}

	return { onUpdate }
}
