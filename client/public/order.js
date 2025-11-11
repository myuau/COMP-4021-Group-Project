// Order pool
const ORDER_POOL = [
    { type: "fried chips", basePrice: 10, baseDueTime: 10000 },
    { type: "fried chicken", basePrice: 25, baseDueTime: 10000 },
    { type: "coke", basePrice: 5, baseDueTime: 10000 },
    { type: "hamburger", basePrice: 20, baseDueTime: 10000 }
];

const ORDER_GENERATION_INTERVAL = 2500;

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
    };
}

function addNewOrder() {
    if(ordersList.length < MAX_ORDERS) {
        const newOrder = generateRandomOrder();
        ordersList.push(newOrder);
    }
    renderOrders();
}

function completeOrder(orderType) {
    // 1. Find the index of the order with the given ID
    const index = ordersList.findIndex(order => order.type === orderType);

    if (index !== -1) {
        const completedOrder = ordersList.splice(index, 1); // Remove 1 item at 'index'
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
    // 1. Clear the existing HTML content
    playerOrderElement.innerHTML = '';
    
    // 2. Build the new list from the array
    ordersList.forEach(order => {
        const listItem = document.createElement('li');
        listItem.classList.add('order-item');
        listItem.id = order.id; // Set the unique ID for later reference
        
        // Add order details
        listItem.innerHTML = `
            <span class="order-type">${order.type.toUpperCase()}</span>
            <span class="order-price">$${order.price}</span>
        `;
        
        // Append to the UL element
        playerOrderElement.appendChild(listItem);
    });
}

function checkEmptyList() {
    if (ordersList.length === 0) {
        console.log("List empty! Generating a guaranteed order.");
        addNewOrder();
    }
}

function gameTick() {
    const currentTime = Date.now();
    let ordersChanged = false; // Flag to track if we need to re-render

    // --- 1. Check for Expired Orders ---
    // Iterate backwards to safely remove items
    for (let i = ordersList.length - 1; i >= 0; i--) {
        const order = ordersList[i];
        
        if (currentTime >= order.finishTime) {
            ordersList.splice(i, 1); // Remove the expired order
            console.log(`Order failed (Time Up): ${order.type}.`);
            ordersChanged = true;
        }
    }

    // --- 2. Check for New Order Generation ---
    const timeSinceLast = currentTime - lastGenerationTime;

    if (timeSinceLast >= ORDER_GENERATION_INTERVAL) {
        if (ordersList.length < MAX_ORDERS) {
            addNewOrder(); // This function now *only* adds an order
            ordersChanged = true;
        }
        // Reset the timer regardless of whether we added one
        lastGenerationTime = currentTime; 
    }
    
    // --- 3. Check for Empty List (if something was removed) ---
    if (ordersChanged && ordersList.length === 0) {
        // This check ensures that if the list was wiped by expirations,
        // we get one new order immediately.
        addNewOrder();
        ordersChanged = true; 
    }

    // --- 4. Render (Only once at the end) ---
    // This updates the UI with all changes *and* updates the timers.
    renderOrders(); 

    gameIntervalId = requestAnimationFrame(gameTick);
}

function endGameTick(id) {
    cancelAnimationFrame(id);
    console.log("Game Tick stopped.");
}