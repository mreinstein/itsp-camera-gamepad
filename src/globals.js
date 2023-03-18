import { vec2 } from './deps.js'


// store game state that is shared across multiple modules in 1 tidy place 🧹

export default {
	camera: {
		position: vec2.create(),   // whatever this is set to will be the center point of the screen
		zoom: 1,
		useRightStickOffset: true, // whether to use the right stick for aim or not
		cameraMoveSpeed: 0.05,     // base speed that the camera will use to move to it's desired position
		toPlayerInputSpeed: 0.075  // we want to move the camera a little faster to the player input position
	},

	// these are all of the globals exposed to the camera script
	scriptEnv: {
		currCameraTarget: _makeCameraTarget(),
		dummyCameraTarget: _makeCameraTarget(),
		smartCameraTarget: _makeCameraTarget(),
		rSmartCameraTarget: _makeCameraTarget(),
		// unused presently, since we're not modeling the cinematic camera or transitioning to/from it
		toSmartCameraInterpolant: 1,
		toSmartCameraZoomInterpolant: 1,
		CameraLib: { },
	},

	gamepad: {
		idx: -1, // index of the connected gamepad within the gamepad list 🎮
		lStickX: 0,
		lStickY: 0,
		rStickX: 0,
		rStickY: 0
	},
	
	cameraDebugDraw: true,
	canvas: undefined, // HTML 2D canvas ref
	ctx: undefined,

	// timekeeping, duh! ⏲
	time: {
		accumulator: 0,
		lastFrameTime: 0
	},

	world: undefined  // ECS data
}


// this factory creates camera target objects, used exclusively in the updateSmartCamera module.
// It's probably too much abstraction, but I purposefully opted to replicate this structure in order 
// to minimize the changes needed to port the camera script from lua.
function _makeCameraTarget (x=170, y=210) {
    const position = [ x, y ]
    const velocity = [ 0, 0 ]

    const pointsOfInterest = [ ]

    const getVelocity = function () {
    	return vec2.clone(velocity)
    }

    const setVelocity = function (dx, dy) {
    	vec2.set(velocity, dx, dy)
    }

    const getPosition = function () {
        return vec2.clone(position)
    }

    const setPosition = function (x, y) {
    	vec2.set(position, x, y)
    }

    return { getPosition, setPosition, getVelocity, setVelocity, lStickX: 0, lStickY: 0, rStickX: 0, rStickY: 0, pointsOfInterest }
}
