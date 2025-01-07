async function fetchDataAndPopulate() {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    // Check if the user is signed in
    if (!authToken || !userId) {
        alert('User not signed in. Please log in to add items to the cart.');
        window.location.href = 'sign-in.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:1337/api/products?populate=*');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const products = data.data;

        const container = document.getElementById('store-data-container');
        container.innerHTML = ''; // Clear previous content

        products.forEach(item => {
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4';

            const imageUrl = item.image?.formats?.medium?.url
                ? `http://localhost:1337${item.image.formats.medium.url}`
                : 'https://via.placeholder.com/150';

            card.innerHTML = `
                <div class="card h-100 border border-none">
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
                                class="btn btn-dark add-to-store-cart" 
                                data-id="${item.id}">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);

            card.querySelector('.add-to-store-cart').addEventListener('click', async event => {
                const productId = event.currentTarget.dataset.id;
                const quantity = parseInt(document.getElementById(`quantity-${productId}`).value);

                try {
                    const response = await fetch('http://localhost:1337/api/carts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({
                            data: {
                                users_permissions_user: userId,
                                products: productId,
                                quantity,
                            },
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`Error: ${response.status}`);
                    }

                    alert('Item added to cart successfully!');
                } catch (error) {
                    console.error('Error adding to cart:', error);
                    alert('Failed to add item to cart.');
                }
            });
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchDataAndPopulate);
