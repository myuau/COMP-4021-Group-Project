const playerBag = [];
const MAX_ITEMS = 4;

const STATIC_CABINET_BOUNDARIES = [
    {
        id: 'fried-chips-cabinet',
        // These values MUST be determined once after the page loads
        // and the layout is stable (e.g., from a final getBoundingClientRect() call).
        top: 20,    // Top screen pixel coordinate
        left: 150,    // Left screen pixel coordinate
        bottom: 140, // Bottom screen pixel coordinate (top + height)
        right: 200,   // Right screen pixel coordinate (left + width)
    },
    {
        id: 'coke-cabinet',
        top: 20,
        left: 355,
        bottom: 140,
        right: 420,
    },
    {
        id: 'bread-cabinet',
        top: 20,
        left: 255,
        bottom: 140,
        right: 300,

    },
    {
        id: 'fish-cabinet',
        top: 20,
        left: 500,
        bottom: 140,
        right: 550,


    },
    {
        id: 'beef-cabinet',
        top: 290,
        left: 65,
        bottom: 410,
        right: 105,

    },
    {
        id: 'chicken-cabinet',
        top: 290,
        left: 700,
        bottom: 410,
        right: 750,

    },
    {
        id: 'lettuce-cabinet',
        top: 290,
        left: 160,
        bottom: 410,
        right: 213,


    },
    {
        id: 'cheese-cabinet',
        top: 290,
        left: 580,
        bottom: 410,
        right: 635,

    },
    {
        id: 'trash-bin',
        top: 20,
        left: 610,
        bottom: 140,
        right: 660,

    },
    {
        id: "cashier-counter",
        top: 420,
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
