const MAX_ORDERS = 3;
const player1OrderElement = document.getElementById('order1-list');
const player2OrderElement = document.getElementById('order2-list');

// Order pool
const ORDER_POOL = [
    { 
        type: "fried chips", 
        basePrice: 15, 
        baseDueTime: 8000, 
        ingredients: ["fried chips"] 
    },
    { 
        type: "coke", 
        basePrice: 10, 
        baseDueTime: 8000, 
        ingredients: ["coke"] 
    },
    { 
        type: "Fish-O-Filet", 
        basePrice: 25, 
        baseDueTime: 12000, 
        ingredients: ["bread", "lettuce", "cheese", "fish"] 
    },
    { 
        type: "McSpicy", 
        basePrice: 30, 
        baseDueTime: 12000, 
        ingredients: ["bread", "lettuce", "cheese", "chicken"] 
    },
    { 
        type: "Beef Burger", 
        basePrice: 30, 
        baseDueTime: 14000, 
        ingredients: ["bread", "lettuce", "cheese", "beef"] 
    }
];

const INGREDIENT_SVG_PATHS = {
    "fried chips": "assets/svgs/fried-chips.svg",
    "coke": "assets/svgs/coke.svg",
    "bread": "assets/svgs/bread.svg",
    "lettuce": "assets/svgs/lettuce.svg",
    "cheese": "assets/svgs/cheese.svg",
    "fish": "assets/svgs/fish.svg",
    "chicken": "assets/svgs/chicken.svg",
    "beef": "assets/svgs/beef.svg",
};

const ORDER_GENERATION_INTERVAL = 2500;

let OrderList1 = [];
let OrderList2 = [];
const lists = [
    {
        id: 'player1',
        list: OrderList1,
        element: player1OrderElement
    },
    {
        id: 'player2',
        list: OrderList2,
        element: player2OrderElement
    }
];

function generateRandomOrder() {
    // 1. Randomly select one item from the pool
    const randomIndex = Math.floor(Math.random() * ORDER_POOL.length);
    const baseOrder = ORDER_POOL[randomIndex];

    // 2. Calculate the due time
    // The due time is when the order should be considered 'failed' or 'late'.
    const currentTime = Date.now();
    const finishTime = currentTime + baseOrder.baseDueTime;

    // 3. Return the complete order object
    return {
        type: baseOrder.type,
        price: baseOrder.basePrice,
        finishTime: finishTime,
        ingredients: baseOrder.ingredients
    };
}

function addNewOrder() {
    if(OrderList1.length < MAX_ORDERS) {
        const newOrder = generateRandomOrder();
        OrderList1.push(newOrder);
    }
    renderOrders();
}

function completeOrder(orderType) {
    // 1. Find the index of the order with the given ID
    const index = OrderList1.findIndex(order => order.type === orderType);

    if (index !== -1) {
        const completedOrder = OrderList1.splice(index, 1); // Remove 1 item at 'index'
        console.log(`Order completed: ${completedOrder[0].type}.`);
        
        // 2. Rearrange the list (re-render)
        // Since we are using an array and `splice()`, the array is automatically
        // "rearranged" (gaps are closed). Calling renderOrders() updates the HTML.
        renderOrders(); 
        
        checkEmptyList();
        
        return true;
    } else {
        console.warn(`Order ID ${orderId} not found.`);
        return false;
    }
}

function renderOrders() {

    for(const item of lists) {
        if(item.id === 'player1') {
        item.element.innerHTML = ''; // Clear existing content

        item.list.forEach(order => {
            const listItem = document.createElement('li');
            listItem.classList.add('order-item');
            // Safely set the ID, only if order.id exists, otherwise leave it off
            if (order.id !== undefined) {
                 listItem.id = order.id; 
            }
    
            // Add order details
            listItem.innerHTML = `
                <div class="order-header-bar">
                    <span class="order-type">${order.type.toUpperCase()}</span>
                    <span class="order-price">$${order.price}</span>
                </div>
            `;
    
            const ingredientsContainer = document.createElement('div');
            ingredientsContainer.classList.add('ingredient-icons');
    
            // --- START OF INGREDIENT ITERATION ---
            
            // Safety Check: Ensure order.ingredients exists and is an array before trying to iterate.
            if (Array.isArray(order.ingredients)) {
                const imagesHtml = order.ingredients.map(ingredient => {
                    // Get the path, or use a placeholder if the path is missing (optional safety)
                    const src = INGREDIENT_SVG_PATHS[ingredient] || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; 
                    
                    // Return the full <img> tag string
                    return `<img src="${src}" alt="${ingredient} icon" class="ingredient-icon">`;
                }).join(''); // Combine the strings into a single block of HTML
                
                ingredientsContainer.innerHTML = imagesHtml;
            }
    
            // --- END OF INGREDIENT ITERATION ---
    
            listItem.appendChild(ingredientsContainer);
    
            // Append to the UL element
            item.element.appendChild(listItem);
        });
        }
    }

}

function checkEmptyList() {
    if (OrderList1.length === 0) {
        console.log("List empty! Generating a guaranteed order.");
        addNewOrder();
    }
}

function gameTick() {
    const currentTime = Date.now();
    let ordersChanged = false; // Flag to track if we need to re-render

    // --- 1. Check for Expired Orders ---
    // Iterate backwards to safely remove items
    for (let i = OrderList1.length - 1; i >= 0; i--) {
        const order = OrderList1[i];
        
        if (currentTime >= order.finishTime) {
            OrderList1.splice(i, 1); // Remove the expired order
            console.log(`Order failed (Time Up): ${order.type}.`);
            ordersChanged = true;
        }
    }

    // --- 2. Check for New Order Generation ---
    const timeSinceLast = currentTime - lastGenerationTime;

    if (timeSinceLast >= ORDER_GENERATION_INTERVAL) {
        if (OrderList1.length < MAX_ORDERS) {
            addNewOrder(); // This function now *only* adds an order
            ordersChanged = true;
        }
        // Reset the timer regardless of whether we added one
        lastGenerationTime = currentTime; 
    }
    
    // --- 3. Check for Empty List (if something was removed) ---
    if (ordersChanged && OrderList1.length === 0) {
        // This check ensures that if the list was wiped by expirations,
        // we get one new order immediately.
        addNewOrder();
        ordersChanged = true; 
    }

    // --- 4. Render (Only once at the end) ---
    // This updates the UI with all changes *and* updates the timers.
    renderOrders(); 
    renderPlayerBag();
    gameIntervalId = requestAnimationFrame(gameTick);
}

function endGameTick(id) {
    cancelAnimationFrame(id);
    console.log("Game Tick stopped.");
}

function removeOrderFromList(completeOrder, ordersList) {
    const index = ordersList.indexOf(completeOrder);
    if (index !== -1) {
        ordersList.splice(index, 1);
        renderOrders();
    }
}
