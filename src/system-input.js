import globals from './globals.js'


// handle gamepad detection and input to control the hero
export default function inputSystem (world) {
	// @param Number dt milliseconds elapsed since last update frame
	const onUpdate = function (dt) {
		const gp = navigator.getGamepads()[globals.gamepad.idx]

		// find the first connected gamepad if we haven't got one already
		if (!gp) {
			const gp = getGamepadsWithStickInput()
			if (gp.length)
				globals.gamepad.idx = gp[0]
		}

		if (gp) {
			// poll for input!
			globals.gamepad.lStickX = gp.axes[0]
			globals.gamepad.lStickY = gp.axes[1]
			globals.gamepad.rStickX = gp.axes[2]
			globals.gamepad.rStickY = gp.axes[3]

		} else {
			// no gamepad found, 0 out input
			globals.gamepad.lStickX = 0
			globals.gamepad.lStickY = 0
			globals.gamepad.rStickX = 0
			globals.gamepad.rStickY = 0
		}
	}

	return { onUpdate }
}


// return the index of all connected gamepads 🎮 that have exactly 4 axes and at least 1 of the sticks engaged
function getGamepadsWithStickInput () {
	const result = [ ]

	//               left stick     right stick
    const AXES = [     0, 1,           2, 3        ]

    navigator.getGamepads().filter(function (gp, gpIdx) {
        if (gp?.axes.length === 4)
            for (let i=0; i < gp.buttons.length; i++)
	        	for (const axisIdx of AXES)
	        		if (Math.abs(gp.axes[axisIdx]) !== 0) {
	        			result.push(gpIdx)
	        			return true
	        		}
    })

    return result
}
