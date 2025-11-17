// This file defines the obstacle module. It is a self-contained component
// responsible for drawing a static image (banana.svg), managing its position,
// tracking its age, and determining its bounding box for collision detection.

const obstacle = function(ctx, x, y) {

    // --- Internal State and Configuration ---
    let isVisible = true;
    // Position state
    let position = { x: x, y: y };

    // This is the creation time of the obstacle for finding its age.
    let birthTime = performance.now();

    // Configuration derived from the original setup:
    // const SCALE = 2; // Scaling factor for rendering
    const FRAME_WIDTH = 50;
    const FRAME_HEIGHT = 50;
    // const RENDER_WIDTH = FRAME_WIDTH * SCALE;
    // const RENDER_HEIGHT = FRAME_HEIGHT * SCALE;

    // Load the SVG image sheet internally
    const sheet = new Image();

    // --- Private Methods ---

    const setSrc = function(src) {
        sheet.src = src;
    }
    /**
     * Sets the position of the obstacle.
     * @param {number} newX - The new x coordinate.
     * @param {number} newY - The new y coordinate.
     */
    const setXY = function(newX, newY) {
        position.x = newX;
        position.y = newY;
    };

    /**
     * Gets the age (in milliseconds) of the obstacle.
     * @param {number} now - The current timestamp.
     * @returns {number} The age of the obstacle.
     */
    const getAge = function(now) {
        return now - birthTime;
    };

    /**
     * Randomizes the obstacle position and resets its age.
     * @param {object} area - An object with a randomPoint() method (e.g., gameArea).
     */
    const randomize = function(area) {
        /* Randomize the position */
        const {x: newX, y: newY} = area.randomPoint();
        setXY(newX, newY);

        /* Reset birth time when randomized */
        birthTime = performance.now();
    };

    /**
     * Draws the obstacle on the canvas.
     */
    const draw = function() {
        ctx.save();
        // Only draw if the image has successfully loaded
        if (!sheet.complete || sheet.naturalWidth === 0) {
            return; 
        }
        if (!isVisible) {
            ctx.restore();
            return;
        }

        // Draw the image directly using the canvas context
        // ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
        ctx.drawImage(
            sheet,              // The image object (banana.svg)
            0,                  // sx (Source X - top-left of source image)
            0,                  // sy (Source Y - top-left of source image)
            FRAME_HEIGHT,      // sh (Source Height)
            FRAME_WIDTH,       // sw (Source Width)
            position.x,
            position.y,
            50,
            50
        );
        ctx.restore();
    };

    /**
     * Update is a placeholder for game loop integration.
     */
    const hide = function() {
        // Since the obstacle is static and not animated, this function is empty.
        isVisible = false;
    };
    const show = function() {
        isVisible = true;
    };
    const Visible = function() {
        return isVisible;
    };

    const getBoundingBox = function() {
        return {
            top: position.y,
            left: position.x,
            bottom: position.y + FRAME_HEIGHT,
            right: position.x + FRAME_WIDTH
        };
    };

    // --- Public Interface ---
    
    // The methods are returned as an object here.
    return {
        getXY: () => position,
        setXY: setXY,
        getAge: getAge,
        randomize: randomize,
        draw: draw,
        show: show,
        hide: hide,
        Visible: Visible,
        getBoundingBox: getBoundingBox,
        setSrc: setSrc
    };
};