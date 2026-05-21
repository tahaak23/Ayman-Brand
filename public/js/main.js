let selectedProduct = null;
let selectedSize = null;
let selectedColor = null;
let allProducts = [];

async function loadProducts() {
  const res = await fetch('/api/products');
  allProducts = await res.json();
  const grid = document.getElementById('products');
  if (allProducts.length === 0) {
    grid.innerHTML = '<p style="text-align:center;font-size:20px;padding:40px;">Aucun produit disponible</p>';
    return;
  }
  allProducts.forEach((product, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/280x250?text=Photo'" style="cursor:pointer;">
      <div class="product-card-body">
        <h2>${product.name}</h2>
        <p class="price">${product.price} DH</p>
        <button data-index="${index}">Commander</button>
      </div>
    `;
    card.querySelector('img').addEventListener('click', () => openProductPage(index));
    card.querySelector('button').addEventListener('click', () => openProductPage(index));
    grid.appendChild(card);
  });
}

function openProductPage(index) {
  selectedProduct = allProducts[index];
  selectedSize = null;
  selectedColor = null;

  document.getElementById('catalog-page') && (document.getElementById('catalog-page').style.display = 'none');
  document.getElementById('product-page').style.display = 'block';

  document.getElementById('detail-name').textContent = selectedProduct.name;
  document.getElementById('detail-name-bread').textContent = selectedProduct.name;
  document.getElementById('detail-price').textContent = selectedProduct.price + ' DH';
  document.getElementById('main-product-img').src = selectedProduct.image;

  const thumbnails = document.getElementById('thumbnails');
  thumbnails.innerHTML = '';
  selectedProduct.colors.forEach((color, i) => {
    const imgUrl = selectedProduct.colorImages[color.trim()] || selectedProduct.image;
    const img = document.createElement('img');
    img.src = imgUrl;
    img.onclick = () => {
      document.getElementById('main-product-img').src = imgUrl;
      document.querySelectorAll('.thumbnails img').forEach(t => t.classList.remove('active'));
      img.classList.add('active');
    };
    if (i === 0) img.classList.add('active');
    thumbnails.appendChild(img);
  });

  const colorsDiv = document.getElementById('detail-colors');
  colorsDiv.innerHTML = '';
  selectedProduct.colors.forEach(color => {
    const btn = document.createElement('button');
    btn.className = 'color-btn-product';
    btn.textContent = color.trim();
    btn.onclick = () => {
      document.querySelectorAll('.color-btn-product').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedColor = color.trim();
      const imgUrl = selectedProduct.colorImages[color.trim()] || selectedProduct.image;
      document.getElementById('main-product-img').src = imgUrl;
    };
    colorsDiv.appendChild(btn);
  });

  const sizesDiv = document.getElementById('detail-sizes');
  sizesDiv.innerHTML = '';
  selectedProduct.sizes.forEach(size => {
    const btn = document.createElement('button');
    btn.className = 'size-btn-product';
    btn.textContent = size.trim();
    btn.onclick = () => {
      document.querySelectorAll('.size-btn-product').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSize = size.trim();
    };
    sizesDiv.appendChild(btn);
  });

  window.scrollTo(0, 0);
}

async function submitOrder() {
  const name = document.getElementById('detail-name-input').value.trim();
  const phone = document.getElementById('detail-phone').value.trim();
  const address = document.getElementById('detail-address').value.trim();
  const city = document.getElementById('detail-city').value.trim();
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
    const msg = document.getElementById('success');
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 3000);
    document.getElementById('detail-name-input').value = '';
    document.getElementById('detail-phone').value = '';
    document.getElementById('detail-address').value = '';
    document.getElementById('detail-city').value = '';
  }
}

loadProducts();
