
// main.js - loads products and injects into pages and uses $ currency
async function loadProducts() { const res = await fetch('data/products.json'); const products = await res.json(); return products; }
function qs(key) { return new URLSearchParams(window.location.search).get(key); }
function formatPrice(n) { return '$' + Number(n).toLocaleString(); }

loadProducts().then(products => {
  const featured = products.filter(p => p.featured).slice(0, 8);
  const container = document.getElementById('featured-row');
  if (container) {
    featured.forEach(p => {
      const col = document.createElement('div'); col.className = 'col-sm-6 col-md-4 col-lg-3';
      col.innerHTML = `
        <div class="card product h-100">
          <img src="${p.image}" class="card-img-top" alt="${p.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${p.name}</h5>
            <p class="mb-2 text-success fw-bold">${formatPrice(p.price)}</p>
            <p class="card-text text-muted small mb-3">${p.category}</p>
            <div class="mt-auto d-flex gap-2">
              <a href="product.html?id=${p.id}" class="btn btn-outline-success btn-sm">View</a>
              <button class="btn btn-success btn-sm add-inline" data-id="${p.id}">Add</button>
            </div>
          </div>
        </div>`;
      container.appendChild(col);
    });
  }

  const productsGrid = document.getElementById('products-grid');
  if (productsGrid) {
    const cat = qs('cat');
    document.getElementById('category-title').textContent = cat ? decodeURIComponent(cat) : 'All Products';
    let list = products;
    if (cat) { list = products.filter(p => p.category === decodeURIComponent(cat)); }

    function render(listToRender) {
      productsGrid.innerHTML = '';
      listToRender.forEach(p => {
        const col = document.createElement('div'); col.className = 'col-sm-6 col-md-4 col-lg-3';
        col.innerHTML = `
          <div class="card product h-100">
            <img src="${p.image}" class="card-img-top">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${p.name}</h5>
              <p class="text-success fw-bold mb-2">${formatPrice(p.price)}</p>
              <div class="mt-auto d-flex justify-content-between">
                <a href="product.html?id=${p.id}" class="btn btn-outline-success btn-sm">View</a>
                <button class="btn btn-success btn-sm add-inline" data-id="${p.id}">Add</button>
              </div>
            </div>
          </div>`;
        productsGrid.appendChild(col);
      });
    }
    render(list);

    const sort = document.getElementById('sort-select');
    if (sort) { sort.addEventListener('change', () => { let sorted = [...list]; if (sort.value === 'price-asc') sorted.sort((a, b) => a.price - b.price); if (sort.value === 'price-desc') sorted.sort((a, b) => b.price - a.price); render(sorted); }); }
  }

  const prodId = qs('id');
  if (prodId) {
    const p = products.find(x => String(x.id) === String(prodId));
    if (p) {
      document.getElementById('product-title').textContent = p.name;
      document.getElementById('product-category').textContent = p.category;
      document.getElementById('product-price').textContent = formatPrice(p.price);
      document.getElementById('product-desc').textContent = p.description;
      document.getElementById('product-img').src = p.image;
      document.getElementById('add-to-cart').addEventListener('click', () => { const qty = parseInt(document.getElementById('qty').value) || 1; addToCart(p.id, qty); alert('Added to cart'); updateCartCount(); });
    }
  }

  document.body.addEventListener('click', e => {
    if (e.target.classList.contains('add-inline')) { const id = e.target.dataset.id; addToCart(id, 1); updateCartCount(); }
  });
  updateCartCount();
});

['year', 'year2', 'year3', 'year4', 'year5', 'year6'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = new Date().getFullYear(); });

// Dark Mode Logic
const darkModeToggle = document.createElement('button');
darkModeToggle.id = 'dark-mode-toggle';
darkModeToggle.innerHTML = '🌙';
darkModeToggle.title = 'Toggle Dark Mode';
const navContainer = document.querySelector('.navbar .container');
if (navContainer) {
  // Insert before the toggler button or at the end of the container
  const toggler = navContainer.querySelector('.navbar-toggler');
  if (toggler) {
    navContainer.insertBefore(darkModeToggle, toggler);
  } else {
    navContainer.appendChild(darkModeToggle);
  }
}

function setDarkMode(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '☀️';
    localStorage.setItem('darkMode', 'true');
  } else {
    document.body.classList.remove('dark-mode');
    darkModeToggle.innerHTML = '🌙';
    localStorage.setItem('darkMode', 'false');
  }
}

darkModeToggle.addEventListener('click', () => {
  setDarkMode(!document.body.classList.contains('dark-mode'));
});

// Init
if (localStorage.getItem('darkMode') === 'true') {
  setDarkMode(true);
}

async function getProductById(id) { const res = await fetch('data/products.json'); const products = await res.json(); return products.find(p => String(p.id) === String(id)); }
window.store = { formatPrice, getProductById };
