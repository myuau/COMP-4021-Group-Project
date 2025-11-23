let player1Bag = [];
let player2Bag = [];
let Bags = [];
const MAX_ITEMS = 4;
let PlayerObject = null;
let OpponentObject = null;

function updateBags(playerAttributes) {
    PlayerObject = playerAttributes.find(attr => attr.name === 'player');
    OpponentObject = playerAttributes.find(attr => attr.name === 'opponent');
    Bags = [
        {
            bagId: PlayerObject.bagId,
            bag: PlayerObject.bag
        },
        {
            bagId: OpponentObject.bagId,
            bag: OpponentObject.bag
        }
    ];
}

const STATIC_CABINET_BOUNDARIES = [
    {
        id: 'fried-chips-cabinet',
        // These values MUST be determined once after the page loads
        // and the layout is stable (e.g., from a final getBoundingClientRect() call).
        top: 20,    // Top screen pixel coordinate
        left: 105,    // Left screen pixel coordinate
        bottom: 220, // Bottom screen pixel coordinate (top + height)
        right: 205,   // Right screen pixel coordinate (left + width)
    },
    {
        id: 'bread-cabinet',
        top: 20,
        left: 270,
        bottom: 220,
        right: 365,

    },
    {
        id: 'coke-cabinet',
        top: 20,
        left: 430,
        bottom: 220,
        right: 520,
    },
    {
        id: 'fish-cabinet',
        top: 20,
        left: 590,
        bottom: 220,
        right: 690,


    },
    {
        id: 'trash-bin',
        top: 70,
        left: 720,
        bottom: 270,
        right: 800,

    },

    {
        id: 'beef-cabinet',
        top: 320,
        left: 40,
        bottom: 400,
        right: 130,

    },
    {
        id: 'lettuce-cabinet',
        top: 320,
        left: 190,
        bottom: 400,
        right: 285,

    },
    {
        id: 'cheese-cabinet',
        top: 320,
        left: 460,
        bottom: 400,
        right: 570,

    },
    {
        id: 'chicken-cabinet',
        top: 320,
        left: 630,
        bottom: 400,
        right: 730,

    },

    {
        id: 'cashier-counter',
        top: 420,
        left: 190,
        bottom: 580,
        right: 600,
    }
];

function updateCabinetBoundariesForEach() {
    // Loop directly over the elements (objects) in the array
    for (const cabinet of STATIC_CABINET_BOUNDARIES) {
        
        // 1. Get the corresponding HTML element using the cabinet's 'id' property
        const element = document.getElementById(cabinet.id);

        if (!element) {
            console.warn(`Warning: HTML element with ID '${cabinet.id}' was not found.`);
            // Skip to the next object if the element doesn't exist
            continue; 
        }

        // 2. Retrieve the bounding box coordinates relative to the viewport
        const rect = element.getBoundingClientRect();

        // 3. Update the properties of the current object directly
        // The values from getBoundingClientRect are correct for viewport coordinates.
        const width = (rect.right - rect.left)/10;
        cabinet.top = rect.top-width*1;
        cabinet.left = rect.left-width*1.2;
        cabinet.bottom = rect.bottom-width*1;
        cabinet.right = rect.right-width*8;
        // cabinet.top = rect.top;
        // cabinet.left = rect.left;
        // cabinet.bottom = rect.bottom;
        // cabinet.right = rect.right;
    }
    console.log("Updated Cabinet Boundaries:", STATIC_CABINET_BOUNDARIES);
}

const CABINET_INGREDIENT_MAP = {
    // Key (Cabinet ID) : Value (Ingredient Name)
    "coke-cabinet": "coke",
    "fried-chips-cabinet": "fried chips",
    "beef-cabinet": "beef",
    "chicken-cabinet": "chicken",
    "fish-cabinet": "fish",
    "bread-cabinet": "bread",
    "cheese-cabinet": "cheese",
    "lettuce-cabinet": "lettuce"
};


function getAllCabinetBoundingBoxes() {
    const cabinetElements = document.querySelectorAll('.cabinet');
    const cabinetBoundingBoxes = [];
    
    cabinetElements.forEach(element => {
        // Use the DOM method to get the current screen position and size
        const rect = element.getBoundingClientRect();
        cabinetBoundingBoxes.push({
            id: element.id,
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right
        });
    });
    return cabinetBoundingBoxes;
}

function getTrashBinBoundingBox() {
    const trashBinElement = document.getElementById('trash-bin');
    const rect = trashBinElement.getBoundingClientRect();
    
    return {
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right
    }
}

function collectIngredient(ingredientName) {
    if (PlayerObject.bag.length < MAX_ITEMS) {
        // Add the new ingredient to the END of the array (Enqueue)
        console.log("add ", ingredientName)
        PlayerObject.bag.push(ingredientName);
        Socket.updatePlayerBag(PlayerObject.bag);
        return true;
    } else {
        return false;
    }
}

function discardIngredient() {
    if (PlayerObject.bag.length > 0) {
        // Remove the oldest ingredient from the FRONT of the array (Dequeue)
        const thrownItem = PlayerObject.bag.shift(); 
        console.log("remove ", thrownItem);
        Socket.updatePlayerBag(PlayerObject.bag);
        return thrownItem;
    } else {
        return null;
    }
}

// NOTE: Assuming INGREDIENT_SVG_PATHS and playerBag are defined globally.

function renderPlayerBag() {

    for (const bagData of Bags) { 
        
        // The original check is now removed/unnecessary if you want to render all bags.
        // If you ONLY wanted to render the bag with id 'player1-bag', you'd use:
        // if (bagData.id !== 'player1-bag') { continue; } 

        const gContainer = document.getElementById(bagData.bagId);
        
        if (!gContainer) {
            console.warn(`SVG container not found for bagId: ${bagData.bagId}`);
            continue; 
        }

        // Clear the container
        gContainer.innerHTML = '';

        // 1. Generate the HTML for the ingredient images
        const imagesHtml = bagData.bag.map(ingredient => {
            const src = INGREDIENT_SVG_PATHS[ingredient]; 
            return `<img src="${src}" alt="${ingredient} icon" class="bag-item">`;
        }).join('');
        
        // 2. Construct the full foreignObject structure
        const fullHtml = `
            <foreignObject width="440" height="150">
                <div style="display: flex; align-items: center; gap: 13px; height: 100%; width: 100%; flex-wrap: wrap;">
                    ${imagesHtml}
                </div>
            </foreignObject>
        `;
        
        // 3. Insert the full structure into the SVG group
        gContainer.innerHTML = fullHtml;
    }
}

function BoundingBoxOverlap(playerBox, cabinetId) {
    const cabinet = STATIC_CABINET_BOUNDARIES.find(
        (item) => item.id === cabinetId 
    );
    return !(playerBox.getRight() < cabinet.left ||
                playerBox.getLeft() > cabinet.right ||
                playerBox.getBottom() < cabinet.top ||
                playerBox.getTop() > cabinet.bottom
            );
}

function CollisionWithAnyItem(playerBox) {
    for (const itemBox of STATIC_CABINET_BOUNDARIES) {
        if (BoundingBoxOverlap(playerBox, itemBox.id)) {
            return true;
        }
    }
    return false;
}

function overlap(boxA, boxB) {
    return !(boxA.right < boxB.left ||
             boxA.left > boxB.right ||
             boxA.bottom < boxB.top ||
             boxA.top > boxB.bottom);
}

function isCollision(box) {
    for (const itemBox of STATIC_CABINET_BOUNDARIES) {
        if (overlap(box, itemBox)) {
            return true;
        }
    }
    return false;
}