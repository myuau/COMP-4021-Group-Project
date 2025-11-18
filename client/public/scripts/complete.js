/**
 * Compares two arrays of ingredients to check if they contain the same items 
 * with the same frequencies, regardless of order.
 * This is crucial for verifying if the player's bag matches an order.
 * * @param {string[]} bag - The player's current collected ingredients.
 * @param {string[]} required - The ingredients required for the order.
 * @returns {boolean} True if the contents match exactly, false otherwise.
 */
function arraysMatchIgnoringOrder(bag, required) {
    if (bag.length !== required.length) {
        return false;
    }

    // Create frequency maps for both arrays
    const bagFrequencies = bag.reduce((map, item) => {
        map[item] = (map[item] || 0) + 1;
        return map;
    }, {});

    const requiredFrequencies = required.reduce((map, item) => {
        map[item] = (map[item] || 0) + 1;
        return map;
    }, {});

    // Check if the maps are identical
    for (const item in requiredFrequencies) {
        if (requiredFrequencies[item] !== bagFrequencies[item]) {
            return false;
        }
    }

    return true;
}

/**
 * Checks if the ingredients in the player's bag exactly match the requirements 
 * of any outstanding order.
 * * @param {string[]} playerBag - The array of ingredients the player currently holds.
 * @param {object[]} outstandingOrders - The array of active orders currently displayed.
 * @returns {object | null} The matching order object if a match is found, otherwise null.
 */
function checkComplete(playerBag, outstandingOrders) {
    // If the bag is empty, no order can be complete.
    if (playerBag.length === 0) {
        return null;
    }

    for (const order of outstandingOrders) {
        // We only check against the ingredients required by the order
        const requiredIngredients = order.ingredients;

        // Use the helper function to compare the two lists
        if (arraysMatchIgnoringOrder(playerBag, requiredIngredients)) {
            // Found a perfect match! Return the entire order object.
            return order;
        }
    }

    // No outstanding order matches the contents of the bag.
    return null;
}

function removeSubmittedIngredients(playerBag) {
    playerBag.length = 0;
    return playerBag; 
}