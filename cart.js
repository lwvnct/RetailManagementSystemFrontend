document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.getElementById("cart-items");
    const selectedItemsList = document.getElementById("selected-items");
    const totalValueElement = document.getElementById("total-value");
    const checkoutButton = document.getElementById("checkout-button");

    // Retrieve cart data from localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function renderCart() {
        cartItemsContainer.innerHTML = "";

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<li class='list-group-item'>Your cart is empty.</li>";
            selectedItemsList.innerHTML = "";
            totalValueElement.textContent = "0";
            checkoutButton.disabled = true;
            return;
        }

        cart.forEach((item, index) => {
            const cartItem = document.createElement("li");
            cartItem.className = "list-group-item d-flex align-items-center justify-content-between";
            cartItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <img 
                        src="${item.image}" 
                        alt="${item.name}" 
                        class="img-thumbnail me-3" 
                        width="75" 
                        height="75"
                    >
                    <span>
                        <strong>${item.name}</strong> - 
                        Price: ${item.price} Php, Quantity: ${item.quantity}, 
                        Total Price: ${item.total} Php
                    </span>
                </div>
                <div>
                    <input 
                        type="checkbox" 
                        class="form-check-input item-checkbox me-2" 
                        id="item-${index}" 
                        data-name="${item.name}" 
                        data-total="${item.total}">
                    <label for="item-${index}" class="form-check-label me-3">Select</label>
                    <button class="btn btn-danger btn-sm delete-button" data-index="${index}">Delete</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        // Add event listeners for checkboxes
        document.querySelectorAll(".item-checkbox").forEach((checkbox) => {
            checkbox.addEventListener("change", updateSelectedItems);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll(".delete-button").forEach((button) => {
            button.addEventListener("click", function () {
                const index = parseInt(button.getAttribute("data-index"));
                deleteCartItem(index);
            });
        });
    }

    function updateSelectedItems() {
        const selectedItems = [];
        let totalValue = 0;

        document.querySelectorAll(".item-checkbox:checked").forEach((checkbox) => {
            const name = checkbox.getAttribute("data-name");
            const total = parseFloat(checkbox.getAttribute("data-total"));

            selectedItems.push({ name, total });
            totalValue += total;
        });

        // Update selected items list
       // selectedItemsList.innerHTML = selectedItems
           // .map((item) => `<li class="list-group-item">${item.name}: ${item.total} Php</li>`)
           // .join("");

        // Update total value
        totalValueElement.textContent = totalValue.toFixed(2);

        // Enable/disable checkout button
        checkoutButton.disabled = selectedItems.length === 0;
    }

    function deleteCartItem(index) {
        // Remove item from cart
        cart.splice(index, 1);

        // Update localStorage
        localStorage.setItem("cart", JSON.stringify(cart));

        // Re-render cart
        renderCart();
    }

    // Handle checkout button click
    checkoutButton.addEventListener("click", function () {
        alert("Checkout successful! Thank you for your purchase.");
        // Clear localStorage or take necessary action
        localStorage.removeItem("cart");
        location.reload();
    });

    // Initial render of the cart
    renderCart();
});
