const CART_KEY = 'eden_cart_v1';
const OPTIONAL_WEBHOOK_URL = ''; // Your server endpoint if you want auto-send via Telegram Bot API

function readCart() {
  const raw = localStorage.getItem(CART_KEY) || '[]';
  return JSON.parse(raw);
}
function writeCart(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); }
function addToCart(id, qty=1) {
  const cart = readCart();
  const found = cart.find(i=>String(i.id)===String(id));
  if(found){ found.qty += qty; } else{ cart.push({id:String(id), qty}); }
  writeCart(cart);
}
function removeFromCart(id){ const cart = readCart().filter(i=>String(i.id)!==String(id)); writeCart(cart); }
function setQty(id, qty){
  const cart = readCart(); const f = cart.find(i=>String(i.id)===String(id));
  if(f) f.qty = qty; writeCart(cart);
}

async function renderCartContents(){
  const c = readCart();
  const container = document.getElementById('cart-contents');
  const subtotalEl = document.getElementById('subtotal');
  if(!container) return;

  if(c.length===0){
    container.innerHTML = '<div class="alert alert-info">Your cart is empty.</div>';
    subtotalEl.textContent = '$0.00';
    return;
  }

  container.innerHTML = ''; 
  let subtotal = 0;
  for(const item of c){
    const p = await window.store.getProductById(item.id);
    const lineTotal = p.price * item.qty; subtotal += lineTotal;

    const div = document.createElement('div');
    div.className='d-flex align-items-center mb-3 cart-item';
    div.innerHTML = `
      <div class="me-3" style="width:80px">
        <img src="${p.image}" style="width:80px;height:80px;object-fit:cover;border-radius:8px">
      </div>
      <div class="flex-grow-1">
        <div class="d-flex justify-content-between">
          <div>
            <strong>${p.name}</strong>
            <div class="text-muted small">${p.category}</div>
          </div>
          <div>${window.store.formatPrice(lineTotal)}</div>
        </div>
        <div class="d-flex gap-2 align-items-center mt-2">
          <input type="number" class="form-control w-25 qty-input" data-id="${p.id}" value="${item.qty}" min="1">
          <button class="btn btn-link text-danger remove-item" data-id="${p.id}">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  }
  subtotalEl.textContent = window.store.formatPrice(subtotal);

  container.querySelectorAll('.remove-item').forEach(btn=>{
    btn.addEventListener('click', e=>{
      removeFromCart(e.target.dataset.id);
      renderCartContents();
      updateCartCount();
    });
  });
  container.querySelectorAll('.qty-input').forEach(input=>{
    input.addEventListener('change', e=>{
      const id=e.target.dataset.id;
      const q=parseInt(e.target.value)||1;
      setQty(id,q);
      renderCartContents();
      updateCartCount();
    });
  });
}

function updateCartCount(){
  const c = readCart();
  const count = c.reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll('#cart-count').forEach(el=>el.textContent = count);
}

document.addEventListener('click', (e)=>{
  if(e.target && e.target.id==='checkout-btn'){
    const cart = readCart();
    if(cart.length===0){ alert('Your cart is empty'); return; }

    // Require Terms & Privacy agreement
    const termsCheck = document.getElementById('termsCheck');
    if(!termsCheck.checked){
      alert('Please confirm that you have read and agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    (async ()=>{
      let message = 'New order from Eden Garden:%0A';
      let total = 0;
      for(const it of cart){
        const p = await window.store.getProductById(it.id);
        const line = `${p.name} x${it.qty} - ${window.store.formatPrice(p.price*it.qty)}`;
        message += encodeURIComponent(line) + '%0A';
        total += p.price*it.qty;
      }
      message += encodeURIComponent('Total: ' + window.store.formatPrice(total)) + '%0A';
      message += encodeURIComponent('Customer: (Add your name here)') + '%0A';

      const TELEGRAM_LINK = 'https://t.me/Benjamin_Sugar'; // replace with your merchant username
      const url = `${TELEGRAM_LINK}?text=${message}`;

      if(OPTIONAL_WEBHOOK_URL){
        try{
          await fetch(OPTIONAL_WEBHOOK_URL, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ message: decodeURIComponent(message), total })
          });
        }catch(err){ console.error('Webhook send failed', err); }
      }

      window.location.href = url;
    })();
  }
});

if(document.getElementById('cart-contents')){ renderCartContents(); }
updateCartCount();




function addToCart(id, qty=1){
  const cart = readCart();
  const found = cart.find(i=>String(i.id)===String(id));
  if(found){ 
    found.qty += qty; 
  } else { 
    cart.push({id:String(id), qty}); 
  }
  writeCart(cart);

  // Show "Added to Cart" notification
  const cartNote = document.getElementById('cart-notification');
  if (cartNote) {
    cartNote.style.display = 'block';
    cartNote.textContent = 'Item added to cart!';
    cartNote.classList.add('show');

    setTimeout(() => {
      cartNote.style.display = 'none';
      cartNote.classList.remove('show');
    }, 2000);
  }

  updateCartCount();
}
