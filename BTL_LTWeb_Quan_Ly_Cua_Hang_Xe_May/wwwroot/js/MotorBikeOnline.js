// Product data with real images
const products = [
    // Row 1
    { id: 1, name: "VinFast Klara S (Kèm pin)", price: "32.120.000", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true },
    { id: 2, name: "VinFast Vento S (Kèm pin)", price: "43.290.000", image: "https://images.unsplash.com/photo-1568772684723-dc07fcb3e9c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true },
    { id: 3, name: "VinFast Theon S (Kèm pin)", price: "50.072.000", image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true },
    { id: 4, name: "VinFast EVO200 LITE (Kèm pin)", price: "24.000.000", image: "https://images.unsplash.com/photo-1554282775-257f006125b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true },
    { id: 5, name: "VinFast EVO200 (Kèm pin)", price: "24.000.000", image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true },
    { id: 6, name: "VinFast VF DrgnFly", price: "18.690.000", image: "https://images.unsplash.com/photo-1571069314924-18f0b8146c1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true },

    // Row 2
    { id: 7, name: "VinFast Motio", price: "10.560.000", image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true, color: "hồng" },
    { id: 8, name: "VinFast Feliz Neo (Kèm pin)", price: "19.712.000", image: "https://images.unsplash.com/photo-1558980664-769d59546b3d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true },
    { id: 9, name: "VinFast Evo Neo (Kèm pin)", price: "15.664.000", image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true },
    { id: 10, name: "VinFast Evo Lite Neo (Kèm Acquy)", price: "12.672.000", image: "https://images.unsplash.com/photo-1579621024320-5bf67f8d4944?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true },
    { id: 11, name: "VinFast Klara Neo (Kèm pin)", price: "25.344.000", image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true },
    { id: 12, name: "VinFast Vento Neo (Kèm pin)", price: "28.160.000", image: "https://images.unsplash.com/photo-1584309983854-7b4e5f5c9a2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true },

    // Row 3
    { id: 13, name: "VinFast Evo Grand (Kèm pin)", price: "18.480.000", image: "https://images.unsplash.com/photo-1570213485955-5c1f8e8e5c9e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true, color: "kem" },
    { id: 14, name: "VinFast Evo Grand Lite (Kèm pin)", price: "15.840.000", image: "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true, color: "tím" },
    { id: 15, name: "VinFast Feliz 2025 (Kèm Pin)", price: "22.792.000", image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true },
    { id: 16, name: "VinFast Feliz Lite (Kèm Pin)", price: "22.792.000", image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true },
    { id: 17, name: "VinFast Vero X (Kèm Pin)", price: "30.712.000", image: "https://images.unsplash.com/photo-1579621024320-5bf67f8d4944?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", official: true }
];

// Function to format price
function formatPrice(price) {
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
}

// Function to render products
function renderProducts(limit = products.length) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '';

    for (let i = 0; i < Math.min(limit, products.length); i++) {
        const product = products[i];
        const productCard = document.createElement('div');
        productCard.className = 'col-lg-2 col-md-3 col-6';

        productCard.innerHTML = `
                    <div class="product-card" data-id="${product.id}">
                        <div class="product-image">
                            <img src="${product.image}" alt="${product.name}">
                            ${product.official ? '<div class="product-badge"><i class="fas fa-check-circle"></i> CHÍNH HÃNG</div>' : ''}
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">${product.name}${product.color ? ` (màu ${product.color})` : ''}</h3>
                            <div class="product-price">${formatPrice(product.price)}</div>
                        </div>
                    </div>
                `;

        productGrid.appendChild(productCard);
    }

    // Show/hide load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (limit >= products.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-block';
    }
}

// Initialize products
let currentLimit = 12; // Show first 12 products initially
renderProducts(currentLimit);

// Load more functionality
document.getElementById('loadMoreBtn').addEventListener('click', function () {
    currentLimit = products.length; // Load all products
    renderProducts(currentLimit);
});

// Reveal phone number
document.getElementById('revealPhoneBtn').addEventListener('click', function () {
    const phoneNumber = document.getElementById('phoneNumber');
    phoneNumber.textContent = '0767891234';
    this.style.display = 'none';
});

// Product card click
document.addEventListener('click', function (e) {
    const productCard = e.target.closest('.product-card');
    if (productCard) {
        const productId = productCard.dataset.id;
        // Navigate to product detail page
        console.log(`Navigate to product ${productId}`);
        // window.location.href = `product-detail.html?id=${productId}`;
    }
});

// Initialize tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
});