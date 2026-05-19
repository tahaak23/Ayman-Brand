let selectedProduct = null;
let selectedSize = null;
let selectedColor = null;

async function loadProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();
  const grid = document.getElementById('products');
  if (products.length === 0) {
    grid.innerHTML = '<p style="text-align:center;font-size:20px;padding:40px;">Aucun produit disponible</p>';
    return;
  }
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/280x250?text=Photo'">
      <h2>${product.name}</h2>
      <p class="price">${product.price} DH</p>
      <button onclick='openModal(${JSON.stringify(product)})'>Commander</button>
    `;
    grid.appendChild(card);
  });
}

function openModal(product) {
  selectedProduct = product;
  selectedSize = null;
  selectedColor = null;
  document.getElementById('modal-product-name').textContent = product.name + ' - ' + product.price + ' DH';
  const sizesDiv = document.getElementById('sizes');
  sizesDiv.innerHTML = '';
  sizesDiv.className = 'sizes-container';
  product.sizes.forEach(size => {
    const btn = document.createElement('button');
    btn.className = 'size-btn';
    btn.textContent = size.trim();
    btn.onclick = () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSize = size.trim();
    };
    sizesDiv.appendChild(btn);
  });
  const colorsDiv = document.getElementById('colors');
  colorsDiv.innerHTML = '';
  colorsDiv.className = 'colors-container';
  product.colors.forEach(color => {
    const btn = document.createElement('button');
    btn.className = 'color-btn';
    btn.textContent = color.trim();
    btn.onclick = () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedColor = color.trim();
    };
    colorsDiv.appendChild(btn);
  });
  document.getElementById('modal').classList.remove('hidden');
}

document.getElementById('close-modal').onclick = () => {
  document.getElementById('modal').classList.add('hidden');
};

document.getElementById('submit-order').onclick = async () => {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  if (!name || !phone || !address || !city) { alert('Veuillez remplir tous les champs !'); return; }
  if (!selectedSize) { alert('Veuillez choisir une taille !'); return; }
  if (!selectedColor) { alert('Veuillez choisir une couleur !'); return; }
  const res = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, address, city, product: selectedProduct.name, size: selectedSize, color: selectedColor })
  });
  const data = await res.json();
  if (data.success) {
    document.getElementById('modal').classList.add('hidden');
    const msg = document.getElementById('success');
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 3000);
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('address').value = '';
    document.getElementById('city').value = '';
  }
};

loadProducts();
