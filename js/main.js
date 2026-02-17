// main.js - Restored to standard classes for CSS compatibility
async function loadProducts() { 
  const res = await fetch('data/products.json'); 
  const products = await res.json(); 
  return products; 
}

function qs(key) { return new URLSearchParams(window.location.search).get(key); }
function formatPrice(n) { return '$' + Number(n).toLocaleString(); }

loadProducts().then(products => {
  // --- Featured Products (Home Page) ---
  const featured = products.filter(p => p.featured).slice(0, 8);
  const container = document.getElementById('featured-row');
  if (container) {
    featured.forEach(p => {
      const col = document.createElement('div'); 
      col.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';
      col.innerHTML = `
        <div class="card product h-100 shadow-sm border-0">
          <div class="p-3 bg-light">
            <img src="${p.image}" class="card-img-top rounded" alt="${p.name}" style="aspect-ratio: 1/1; object-fit: contain;">
          </div>
          <div class="card-body d-flex flex-column">
            <p class="text-success small fw-bold mb-1">${p.category}</p>
            <h5 class="card-title h6">${p.name}</h5>
            <p class="fw-bold mb-3">${formatPrice(p.price)}</p>
            <div class="mt-auto d-flex gap-2">
              <a href="product.html?id=${p.id}" class="btn btn-outline-success btn-sm flex-grow-1">View</a>
              <button class="btn btn-success btn-sm add-inline flex-grow-1" data-id="${p.id}">Add</button>
            </div>
          </div>
        </div>`;
      container.appendChild(col);
    });
  }

  // --- Products Grid (Products Page) ---
  const productsGrid = document.getElementById('products-grid');
  if (productsGrid) {
    const cat = qs('cat');
    const titleEl = document.getElementById('category-title');
    if (titleEl) titleEl.textContent = cat ? decodeURIComponent(cat) : 'All Products';
    
    let list = products;
    if (cat) { list = products.filter(p => p.category === decodeURIComponent(cat)); }

    function render(listToRender) {
      productsGrid.innerHTML = '';
      listToRender.forEach(p => {
        const col = document.createElement('div'); 
        col.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';
        col.innerHTML = `
          <div class="card product h-100 shadow-sm border-0">
             <div class="p-3 bg-light">
              <img src="${p.image}" class="card-img-top rounded" alt="${p.name}" style="aspect-ratio: 1/1; object-fit: contain;">
            </div>
            <div class="card-body d-flex flex-column">
              <p class="text-success small fw-bold mb-1">${p.category}</p>
              <h5 class="card-title h6">${p.name}</h5>
              <p class="fw-bold mb-3">${formatPrice(p.price)}</p>
              <div class="mt-auto d-flex gap-2">
                <a href="product.html?id=${p.id}" class="btn btn-outline-success btn-sm flex-grow-1">View</a>
                <button class="btn btn-success btn-sm add-inline flex-grow-1" data-id="${p.id}">Add</button>
              </div>
            </div>
          </div>`;
        productsGrid.appendChild(col);
      });
    }
    render(list);

    const sort = document.getElementById('sort-select');
    if (sort) { 
      sort.addEventListener('change', () => { 
        let sorted = [...list]; 
        if (sort.value === 'price-asc') sorted.sort((a, b) => a.price - b.price); 
        if (sort.value === 'price-desc') sorted.sort((a, b) => b.price - a.price); 
        render(sorted); 
      }); 
    }
  }

  // Rest of your logic (Product ID, Dark Mode, Year) stays exactly the same...
  const prodId = qs('id');
  if (prodId) {
    const p = products.find(x => String(x.id) === String(prodId));
    if (p) {
      document.getElementById('product-title').textContent = p.name;
      document.getElementById('product-category').textContent = p.category;
      document.getElementById('product-price').textContent = formatPrice(p.price);
      document.getElementById('product-desc').textContent = p.description;
      document.getElementById('product-img').src = p.image;
      document.getElementById('add-to-cart').addEventListener('click', () => { 
        const qty = parseInt(document.getElementById('qty').value) || 1; 
        addToCart(p.id, qty); 
        alert('Added to cart'); 
        updateCartCount(); 
      });
    }
  }

  document.body.addEventListener('click', e => {
    if (e.target.classList.contains('add-inline')) { 
      const id = e.target.dataset.id; 
      addToCart(id, 1); 
      updateCartCount(); 
    }
  });
  updateCartCount();
});

['year', 'year2', 'year3', 'year4', 'year5', 'year6'].forEach(id => { 
  const el = document.getElementById(id); 
  if (el) el.textContent = new Date().getFullYear(); 
});

// Dark Mode logic continues here...