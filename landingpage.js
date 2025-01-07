async function fetchDataAndPopulate() {
    try {
        // Replace with your actual API URL
        const response = await fetch('http://localhost:1337/api/products?populate=*');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Extracting the array of products
        const products = data.data;

        // Get the container to populate the cards
        const container = document.getElementById('data-container');
        container.innerHTML = ''; // Clear previous content

        // Dynamically create Bootstrap cards
        products.forEach(item => {
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4'; // Bootstrap grid classes

            // Use the thumbnail URL if available, otherwise use the default image
            const imageUrl = item.image && item.image.formats.medium
                ? `http://localhost:1337${item.image.formats.medium.url}`
                : 'https://via.placeholder.com/150';

            card.innerHTML = `
                <div class="card">
    <img src="${imageUrl}" class="card-img-top" alt="${item.productName}" width="150" height="150">
    <div class="card-body">
        <h5 class="card-title">${item.productName}</h5>
        <p class="card-text">Price: ${item.Price} Php</p>
        <p class="card-text">Brand: ${item.brand}</p>
        <p class="card-text">Available Quantity: ${item.quantity}</p>
        <div class="d-flex align-items-center">
            <label for="quantity-${item.id}" class="me-2">Quantity:</label>
            <input 
                type="number" 
                id="quantity-${item.id}" 
                class="form-control me-2" 
                style="width: 80px;" 
                min="1" 
                max="${item.quantity}" 
                value="1">
            <button 
                class="btn btn-primary add-to-cart" 
                data-id="${item.id}" 
                data-product-name="${item.productName}" 
                data-price="${item.Price}" 
                data-brand="${item.brand}" 
                data-image="${imageUrl}">
                Add to Cart
            </button>
        </div>
    </div>
</div>

            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchDataAndPopulate);


document.addEventListener("click", function (event) {
    if (event.target.classList.contains("add-to-cart")) {
        const button = event.target;
        const productId = button.getAttribute("data-id");
        const productName = button.getAttribute("data-product-name");
        const productPrice = parseFloat(button.getAttribute("data-price"));
        const productBrand = button.getAttribute("data-brand");
        const productImage = button.getAttribute("data-image");
        const quantityInput = document.getElementById(`quantity-${productId}`);
        const quantity = parseInt(quantityInput.value);

        if (quantity > 0) {
            const totalPrice = productPrice * quantity;

            // Get the current cart from localStorage or initialize an empty array
            const cart = JSON.parse(localStorage.getItem("cart")) || [];

            // Add the new item to the cart
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                brand: productBrand,
                image: productImage,
                quantity: quantity,
                total: totalPrice,
            });

            // Save the updated cart back to localStorage
            localStorage.setItem("cart", JSON.stringify(cart));

            alert(`${productName} added to cart!`);
        } else {
            alert("Please enter a valid quantity.");
        }
    }
});
