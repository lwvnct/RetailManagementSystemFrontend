// Get the logged-in user's ID from localStorage
const loggedInUserId = localStorage.getItem('userId');

// API endpoints
const productsApiUrl = "http://localhost:1337/api/products?populate=*";
const cartsApiUrl = "http://localhost:1337/api/carts?populate=*";
const orderedItemsApiUrl = "http://localhost:1337/api/ordered-items?populate=*";

// Fetch products and cart data
Promise.all([
    fetch(productsApiUrl).then(response => response.json()),
    fetch(cartsApiUrl).then(response => response.json())
])
    // extract only the carts that belong to the currently logged-in user.
    .then(([productsData, cartsData]) => {
        const userCarts = cartsData.data.filter(cart => cart.users_permissions_user.id == loggedInUserId);
        displayCarts(userCarts, productsData.data);
    })
    .catch(error => console.error("Error fetching data:", error));

// Function to display cart data
function displayCarts(carts, products) {
    const cartContainer = document.getElementById("cart-container");

    if (carts.length === 0) {
        cartContainer.innerHTML = "<p>No items in your cart.</p>";
        return;
    }

    // Loop through each cart and display products
    carts.forEach(cart => {
        const productsHtml = cart.products.map(cartProduct => {
            const product = products.find(p => p.id === cartProduct.id);
            if (!product) return '';

            const imageUrl = product.image?.formats?.medium?.url
                ? `http://localhost:1337${product.image.formats.medium.url}`
                : 'https://via.placeholder.com/150';
            const totalPrice = product.Price * cart.quantity;

            return `
                <div class="product-row" id="${cart.documentId}" data-name="${product.productName}" data-quantity="${cart.quantity}" data-price="${product.Price}" data-product-id="${cartProduct.id}">
                    <ul class="list-group">
                        <li class="list-group-item">
                            <div class="row">
                                <div class="col-2">
                                    <img src="${imageUrl}" alt="${product.productName}" class="product-image" style="width: 70px; height: 70px;">
                                </div>
                                <div class="col-5">
                                    <p><strong>Product Name:</strong> ${product.productName}</p>
                                </div>
                                <div class="col-2">
                                    <p><strong>Quantity:</strong> ${cart.quantity}</p>
                                </div>
                                <div class="col-3">
                                    <p><strong>Total Price:</strong> ${totalPrice.toFixed(2)} Php</p>
                                    <label for="checkbox-${cart.documentId}" class="mr-2">Select</label>
                                    <input type="checkbox" class="item-checkbox" id="checkbox-${cart.documentId}" data-price="${totalPrice}" onchange="updateTotalAmount()">
                                    <button class="btn btn-danger" onclick="deleteCartItem('${cart.documentId}')">Remove</button>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            `;
        }).join("");

        // Create cart HTML
        const cartHtml = `<div class="cart-item">${productsHtml}<hr></div>`;
        cartContainer.innerHTML += cartHtml;
    });

    // Create total section
    const totalSection = document.createElement('div');
    totalSection.id = "total-section";
    totalSection.innerHTML = `
        <h5>Selected Items:</h5>
        <ul id="selected-items-container" class="list-group"></ul>
        <h5>Total Amount: <span id="total-amount">0.00</span> Php</h5>
        <button class="btn btn-primary mt-3" onclick="checkout()">Checkout</button>
    `;
    cartContainer.appendChild(totalSection);
}

// Function to delete a cart item
//called when the remove button is clicked
function deleteCartItem(cartDocumentId) {
    const deleteUrl = `http://localhost:1337/api/carts/${cartDocumentId}`;
    fetch(deleteUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete cart item');
            location.reload();
        })
        .catch(error => console.error("Error deleting item:", error));
}

// Function to update total amount
//called when a checkbox is checked or unchecked
function updateTotalAmount() {
    const checkboxes = document.querySelectorAll('.item-checkbox');
    let totalAmount = 0;
    const selectedItemsContainer = document.getElementById('selected-items-container');
    selectedItemsContainer.innerHTML = '';

    // Loop through all checkboxes and calculate total amount
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const productRow = checkbox.closest('.product-row');
            const productName = productRow.dataset.name;
            const quantity = productRow.dataset.quantity;
            const price = productRow.dataset.price;
            const totalPrice = parseFloat(price) * parseInt(quantity);

            const selectedItemHtml = `<li class="list-group-item d-flex justify-content-between align-items-center">${productName} (Qty: ${quantity}) - ${totalPrice.toFixed(2)} Php</li>`;
            selectedItemsContainer.innerHTML += selectedItemHtml;

            totalAmount += totalPrice;
        }
    });
    
    // Update total amount in the UI
    document.getElementById('total-amount').textContent = totalAmount.toFixed(2);
}

// Checkout function
//called when the checkout button is clicked
function checkout() {
    const checkboxes = document.querySelectorAll('.item-checkbox');
    const selectedProducts = [];
    const cartItemsToDelete = [];

    // Loop through all checkboxes and get selected products
    // Add selected products to the selectedProducts array
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const productRow = checkbox.closest('.product-row');
            const productId = parseInt(productRow.dataset.productId);
            const quantity = parseInt(productRow.dataset.quantity);
            const price = parseFloat(productRow.dataset.price);
            const totalPrice = price * quantity;
            const cartDocumentId = productRow.id;

            // Add selected product to the list
            selectedProducts.push({
                products: productId,
                quantity,
                totalPrice
            });

            // Add cart item to delete list
            cartItemsToDelete.push(cartDocumentId);
        }
    });

    if (selectedProducts.length === 0) {
        alert("Please select items to checkout.");
        return;
    }

    // Checkout selected products
    const checkoutPromises = selectedProducts.map(product => {
        const payload = {
            data: {
                users_permissions_user: parseInt(loggedInUserId),
                products: product.products,
                quantity: product.quantity, 
                totalPrice: product.totalPrice
            }
        };

        // Create ordered item
        return fetch(orderedItemsApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Failed to checkout product ID ${product.products}`);
            }
            return response.json();
        });
    });

    // Wait for all checkout promises to complete
    Promise.all(checkoutPromises)
    // Remove checked-out items from the cart
        .then(() => {
            alert("Checkout successful!");

            Promise.all(
                cartItemsToDelete.map(cartDocumentId => {
                    const deleteUrl = `http://localhost:1337/api/carts/${cartDocumentId}`;
                    return fetch(deleteUrl, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                    });
                })
            )
                .then(() => {
                    alert("Checked-out items removed from the cart.");
                    location.reload();
                })
                .catch(error => console.error("Error removing items from cart:", error));
        })
        .catch(error => {
            console.error("Error during checkout:", error);
            alert("Error during checkout. Check console for details.");
        });
}


