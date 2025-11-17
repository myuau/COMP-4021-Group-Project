const playerBag = [];
const MAX_ITEMS = 4;

const STATIC_CABINET_BOUNDARIES = [
    {
        id: 'fried-chips-cabinet',
        // These values MUST be determined once after the page loads
        // and the layout is stable (e.g., from a final getBoundingClientRect() call).
        top: 20,    // Top screen pixel coordinate
        left: 150,    // Left screen pixel coordinate
        bottom: 180, // Bottom screen pixel coordinate (top + height)
        right: 230,   // Right screen pixel coordinate (left + width)
    },
    {
        id: 'bread-cabinet',
        top: 20,
        left: 250,
        bottom: 180,
        right: 330,

    },
    {
        id: 'coke-cabinet',
        top: 20,
        left: 355,
        bottom: 180,
        right: 440,
    },
    {
        id: 'fish-cabinet',
        top: 20,
        left: 480,
        bottom: 180,
        right: 560,


    },
    {
        id: 'trash-bin',
        top: 20,
        left: 595,
        bottom: 180,
        right: 660,

    },

    {
        id: 'beef-cabinet',
        top: 280,
        left: 45,
        bottom: 410,
        right: 125,

    },
    {
        id: 'lettuce-cabinet',
        top: 280,
        left: 145,
        bottom: 410,
        right: 215,


    },
    {
        id: 'cheese-cabinet',
        top: 280,
        left: 560,
        bottom: 410,
        right: 645,

    },
    {
        id: 'chicken-cabinet',
        top: 280,
        left: 675,
        bottom: 410,
        right: 755,

    },

    {
        id: 'cashier-counter',
        top: 410,
        left: 200,
        bottom: 580,
        right: 600,
    }
];

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
    if (playerBag.length < MAX_ITEMS) {
        // Add the new ingredient to the END of the array (Enqueue)
        console.log("add ", ingredientName);
        playerBag.push(ingredientName);
        return true;
    } else {
        return false;
    }
}

function discardIngredient() {
    if (playerBag.length > 0) {
        // Remove the oldest ingredient from the FRONT of the array (Dequeue)
        const thrownItem = playerBag.shift(); 
        console.log("remove ", thrownItem);
        return thrownItem;
    } else {
        return null;
    }
}

// NOTE: Assuming INGREDIENT_SVG_PATHS and playerBag are defined globally.

function renderPlayerBag() {
    const gContainer = document.getElementById("held-food-group");

    gContainer.innerHTML = '';

    const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    foreignObject.setAttribute('width', '300');
    foreignObject.setAttribute('height', '150');

    const htmlDiv = document.createElement('div');

    htmlDiv.style.cssText = 'display: flex; align-items: center; gap: 4px; height: 100%;';
    

    const imagesHtml = playerBag.map(ingredient => {
        const src = INGREDIENT_SVG_PATHS[ingredient]; 
        return `<img src="${src}" 
                alt="${ingredient} icon" 
                class="bag-item" 
                style="width: 70px; height: 70px;">`;
    }).join('');
    
    htmlDiv.innerHTML = imagesHtml;
    
    foreignObject.appendChild(htmlDiv);
    
    gContainer.appendChild(foreignObject);
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