import * as Draw from './Draw.js'
import globals   from './globals.js'
import { vec2 }  from './deps.js'


// this is a pretty close port from lua of Ryan's most excellent camera code for ITSP

const { currCameraTarget, dummyCameraTarget, smartCameraTarget, rSmartCameraTarget } = globals.scriptEnv


// when the camera target enters a point of interest, a certain amount of influence will be put on the
// camera to go towards the point of interest instead of the camera target.
let currPointOfInterestPercentage = 1 
                                        
const currRCamOffset = [ 0, 0 ] // this is the amount of offset we will put on the camera target due to right stick input.


// we want to move the right stick influence smoothly and accurately, so we are keeping track of the last 100 frames of right stick input.
// this way if the player quickly fires a shot in a different direction, we don't swing the camera around wildly.
const numSticks = 50 // the amount of frames we are going to keep track of
const averageSticks = new Array(numSticks)

const totalSticks = [ 0, 0 ] // the total amount of stick input used for making the average
const averageStick = [ 0, 0 ] // the average stick value used for calculating right stick camera offset
let stickHead = 0 // instead of reordering an array, we will just overwrite what is currently the last indexed value

// initialize all the stick inputs to 0
for (let i = 0; i < numSticks; i++)
    averageSticks[i] = [ 0, 0 ]


const lStickCameraInfluence = 1 // we are going to move the camera based of the velocity of the camera target

// TODO: why does multiplying right stick camera influence by 24 cause the aim influence to work correctly?
//       without this scaling, aiming influence doesn't seem to work
const rStickCameraInfluence = 6 * 24  // we need to weight the amount we use for right stick influence vs velocity influence
const toSmartCamZoomSpeed = 0.35 // this is how fast the camera will change it's zoom


// we can't let the camera target get off screen, this is the safe zone border we will be using in screen space
const safeZoneX = 513 
const safeZoneY = 288 


export default function updateSmartCamera () {

    //const cameraMoveSpeed = 0.05 // this is the base speed that the camera will use to move to it's desired position
    //const toPlayerInputSpeed = 0.075  // we want to move the camera a little faster to the player input position
    const { cameraMoveSpeed, toPlayerInputSpeed } = globals.camera

	const targetVel = currCameraTarget.getVelocity()
    const targetPos = currCameraTarget.getPosition()
    const newCamPos = currCameraTarget.getPosition() // this will end up being the position of the camera

    // retrieve the inputs from the camera target
    const { lStickX, lStickY, rStickX, rStickY } = currCameraTarget

    // initialize the destination variables
    const desiredStickPosition = currCameraTarget.getPosition()
    const dummyCamPos = dummyCameraTarget.getPosition()
    const smartCamPos = smartCameraTarget.getPosition()
    
    // we need to find out where the points of interest are, because the smart camera target will move 
    // based on how close to a POI you are. The point of interest will tell the camera target how much camera influence it desires.
    // If the camera is in more than one POI, we need to average those amounts to put the camera in the correct position.
    let pointOfInterestPos
    let pointOfInterestPercentage = 1
    const avgCamPos = [ 0, 0 ]
    let poiCount = 0
    let totalPointOfInterestInfluence = 0
    let currentPOIZoom = 0
    
    // the idea here is that we can't just take the average between all the points of interest position alone.
    // If we did we would get a jumping effect as the player transitioned out of many into one.
    // The higher the camera influence is on a POI, the stronger we should pull the camera to that one.
    if (currCameraTarget.pointsOfInterest.length) {

        // let's get the total amount of camera influence being applied this frame.
        for (const currPOI of currCameraTarget.pointsOfInterest)
            totalPointOfInterestInfluence += currPOI.cameraInfluence

        // Now get the average position and zoom based on the influence being applied by each POI.
        for (const currPOI of currCameraTarget.pointsOfInterest)  {
            if (currPOI.enabled) {
                pointOfInterestPos = currPOI.pos // the center of the POI

                // This is the desired camera position determined by this POI.
                newCamPos[0] = (currPOI.pos[0] - newCamPos[0]) * currPOI.cameraInfluence + newCamPos[0]
                newCamPos[1]  = (currPOI.pos[1] - newCamPos[1]) * currPOI.cameraInfluence + newCamPos[1]
                
                // we need to make sure we avoid a divide by 0 case.  Just don't use POI influence if that happens.
                if (totalPointOfInterestInfluence == 0) {
                	vec2.copy(avgCamPos, dummyCamPos)
                } else {
                    avgCamPos[0] += (newCamPos[0] * currPOI.cameraInfluence / totalPointOfInterestInfluence)
                    avgCamPos[1] += (newCamPos[1] * currPOI.cameraInfluence / totalPointOfInterestInfluence)
                }
                
                /*
                // We will start with the ambient zoom, and get an average of points of interest zooms
                // if the poi doesn't have a zoom set it should use the current zoom.  A zoom value of -1 means it is not set.
                if (currPOI.targetZoom === -1)
                    currentPOIZoom += CameraLib.newZoom
                else
                    currentPOIZoom += currPOI.percentageZoom
                */
                poiCount++
            }
        }
    }
    
    // If we have a cinematic camera set, we want to return smart camera control smoothly.  We will interpolate from the cinematic camera 
    // to the smart camera.  A cameraSmoothedVal of 1 means the smart camera has complete control.
    let cameraSmoothedVal = 1
    /*
    if(toSmartCameraInterpolant < 1) then
        toSmartCameraInterpolant = toSmartCameraInterpolant + toSmartCameraSpeed
        cameraSmoothedVal = UtilLib.easeIn(toSmartCameraInterpolant)
    end
    
    local cameraZoomSmoothedVal = 1
    if(toSmartCameraZoomInterpolant < 1) then
        toSmartCameraZoomInterpolant = toSmartCameraZoomInterpolant + toSmartCameraZoomSpeed
        cameraZoomSmoothedVal = UtilLib.easeIn(toSmartCameraZoomInterpolant)
    end
    */
    
    // if there are any points of interest, we need to find the desired zoom level.
    if (poiCount > 0) {
    	vec2.copy(newCamPos, avgCamPos)
        pointOfInterestPercentage = totalPointOfInterestInfluence / poiCount
        currentPOIZoom = currentPOIZoom / (poiCount)
        /*CameraLib.interpolateCameraZoom(currentPOIZoom,toSmartCamZoomSpeed * cameraZoomSmoothedVal)*/
    }/* else {
        // if we are leaving a point of interest, or the camera target has hit a zoom trigger, we need to approach that new zoom level
        // using an ease function.
        if (UtilLib.withinThreshold( getCameraZoom(),CameraLib.ambientZoom,0.1) == false)
            CameraLib.interpolateCameraZoom(CameraLib.newZoom,toSmartCamZoomSpeed* cameraZoomSmoothedVal) // if no POI's go to the ambient zoom
    }*/
    
    
    // this is how we slowly move to the point of interest position, instead of snapping immediately to it.
    const toDesiredPOIpercentage = (pointOfInterestPercentage - currPointOfInterestPercentage) * cameraMoveSpeed
    currPointOfInterestPercentage = currPointOfInterestPercentage + toDesiredPOIpercentage
    pointOfInterestPercentage = currPointOfInterestPercentage

    
    // We have a desired velocity based offset, a desired right stick input offset, and a point of interest offset.
    // We will be moving the camera to the average of these influences.  The further the camera is from the desired target, the faster it will move. 
    const velocityInfluence = lStickCameraInfluence * pointOfInterestPercentage

    smartCameraTarget.setPosition(targetPos[0] + targetVel[0] * velocityInfluence, targetPos[1] + targetVel[1] * velocityInfluence)
    vec2.copy(smartCamPos, smartCameraTarget.getPosition())
    
    const aimingInfluence = rStickCameraInfluence * pointOfInterestPercentage

    rSmartCameraTarget.setPosition(targetPos[0] + currRCamOffset[0] * aimingInfluence, targetPos[1] + currRCamOffset[1] * aimingInfluence)
    const rSmartCamPos = rSmartCameraTarget.getPosition()
    
    // we are getting the average of all the stick inputs for the last 100 frames and choosing the average position
    const lastHead = averageSticks[stickHead]
    totalSticks[0] = totalSticks[0] - lastHead[0] + rStickX
    totalSticks[1] = totalSticks[1] - lastHead[1] + rStickY
    averageSticks[stickHead][0] = rStickX
    averageSticks[stickHead][1] = rStickY
   
    stickHead = (stickHead + 1) % numSticks // instead of rewriting and adding up the entire array again, just update the last element
    
    averageStick[0] = totalSticks[0] / numSticks
    averageStick[1] = totalSticks[1] / numSticks

    const toDesiredRCamPosX = (averageStick[0] - currRCamOffset[0]) * cameraMoveSpeed
    const toDesiredRCamPosY = (averageStick[1] - currRCamOffset[1]) * cameraMoveSpeed
    
    currRCamOffset[0] += toDesiredRCamPosX
    currRCamOffset[1] += toDesiredRCamPosY

    // get the average position between the velocity target and the aiming target
    if (globals.camera.useRightStickOffset) {
        desiredStickPosition[0] = (smartCamPos[0] + rSmartCamPos[0]) / 2
        desiredStickPosition[1] = (smartCamPos[1] + rSmartCamPos[1]) / 2
    } else {
       desiredStickPosition[0] = (smartCamPos[0] + targetPos[0]) / 2
       desiredStickPosition[1] = (smartCamPos[1] + targetPos[1]) / 2
    }

    // we will be moving the camera to a desired location, this is the movement on the x and y axis
    // the vector to the player input target plus the vector to the desired point of interest spot
    const toNewPosX = ((desiredStickPosition[0] - dummyCamPos[0]) * toPlayerInputSpeed) * (1-pointOfInterestPercentage) + (newCamPos[0] - dummyCamPos[0]) * cameraMoveSpeed
    const toNewPosY = ((desiredStickPosition[1] - dummyCamPos[1]) * toPlayerInputSpeed) * (1-pointOfInterestPercentage) + (newCamPos[1] - dummyCamPos[1]) * cameraMoveSpeed

    // move the camera
    dummyCameraTarget.setPosition(dummyCamPos[0] + toNewPosX * cameraSmoothedVal, dummyCamPos[1] + toNewPosY * cameraSmoothedVal)

    /*
    // if we are already returned to the smart camera, then check to see if we are within acceptable bounds, the "safe zone" of the screen.
    if (toSmartCameraInterpolant >= 1) { 

        const movedCamPos = dummyCamPos

        // let's do a border check here... if the ship has crossed the border we need to force camera movement.
        let newX = movedCamPos[0]
        let newY = movedCamPos[1]
        const targetPos = currCameraTarget.getPosition()

        let centerX, centerY = GameLib.screenToWorld( 0, 0 )
        let maxWorldDeltaX, maxWorldDeltaY = GameLib.screenToWorld( safeZoneX, safeZoneY ) // extents of the 'safe zone'
        maxWorldDeltaX = math.abs(maxWorldDeltaX - centerX)
        maxWorldDeltaY = math.abs(maxWorldDeltaY - centerY)

        const worldDistY = newY - targetPos[1]
        const worldDistX = newX - targetPos[0]
        
        // if the camera target is outside the safe zone, then force the camera to move into an acceptable position.
        if (worldDistY < -maxWorldDeltaY)
            newY = targetPos[1] - maxWorldDeltaY

        if (worldDistY > maxWorldDeltaY)
            newY = targetPos[1] + maxWorldDeltaY

        if (worldDistX < -maxWorldDeltaX)
            newX = targetPos[0] - maxWorldDeltaX

        if (worldDistX > maxWorldDeltaX)
           newX = targetPos[0] + maxWorldDeltaX

        dummyCamPos[0] = newX
        dummyCamPos[1] = newY

        dummyCameraTarget.setPosition(newX, newY)
        dummyCamPos = dummyCameraTarget.getPosition()
    }
    */

    const { canvas, ctx, camera, cameraDebugDraw } = globals

    if (cameraDebugDraw) {
        // postion "dummy" camera
        ctx.save()
        ctx.scale(camera.zoom, camera.zoom)
        ctx.translate(
            -camera.position[0] + (canvas.width / camera.zoom / 2),
            -camera.position[1] + (canvas.height / camera.zoom / 2)
        )

        Draw.square(ctx, desiredStickPosition, 6, '#0ff')

        // where the ship is at
        Draw.circle(ctx, newCamPos, 30, '#000')

        // where the left stick is currently pointing
        Draw.circle(ctx, [ newCamPos[0] + lStickX * 30, newCamPos[1] + lStickY * 30 ], 10, '#ff0')

        // where the right stick is currently pointing
        Draw.circle(ctx, [ newCamPos[0] + rStickX * 30, newCamPos[1] + rStickY * 30 ], 10, '#f00')

        if (pointOfInterestPos) {
            let strokeStyle = `rgb(${Math.round(0.5 * 255)}, ${Math.round(0.4 * 255)}, ${Math.round(0.2 * 255)})`
            Draw.square(ctx, pointOfInterestPos, 24, strokeStyle)
            Draw.square(ctx, newCamPos, 6, strokeStyle)
            Draw.line(ctx, newCamPos, pointOfInterestPos, `rgb(${255 * 0.5}, ${255 * 0.4}, ${255 * 0.2})`)
        }

        Draw.square(ctx, [ newCamPos[0] + averageStick[0] * 30, newCamPos[1] + averageStick[1] * 30], 6, '#0f0')
        
        Draw.square(ctx, [ newCamPos[0] + currRCamOffset[0] * 30, newCamPos[1] + currRCamOffset[1] * 30], 6, 'rgb(128,128,0)')

        Draw.square(ctx, smartCamPos, 24, '#ff0')

        Draw.square(ctx, rSmartCamPos, 24, '#f00')

        ctx.restore()
    }
}
