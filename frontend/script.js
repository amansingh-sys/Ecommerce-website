const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const API = '/api';
let products = [], cart = [], wishlist = [], currentUser = null;
let category = new URLSearchParams(location.search).get('category') || 'All', authMode = 'login';
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const headers = () => ({ 'Content-Type': 'application/json' });
async function api(path, options = {}) {
  const response = await fetch(API + path, { credentials: 'same-origin', ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}
function toast(msg) { const t = $('#toast'); if (!t) { alert(msg); return; } t.textContent = msg; t.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('show'), 2600); }
function imageUrl(image) { return image?.startsWith('http') ? image : image || 'https://placehold.co/600x500/f1eee8/333?text=PremiumStore'; }
async function loadProducts() {
  const params = new URLSearchParams();
  if (category !== 'All') params.set('category', category);
  if ($('#searchInput')?.value) params.set('search', $('#searchInput').value);
  if ($('#sortSelect')?.value) params.set('sort', $('#sortSelect').value);
  const data = await api('/products?' + params.toString());
  products = data.products.map(p => ({ ...p, id: p._id }));
  renderProducts();
}
function renderProducts() {
  const grid = $('#productGrid'); if (!grid) return;
  grid.innerHTML = products.map(p => `<article class="product-card"><div class="product-image" data-open="${p.id}"><img src="${imageUrl(p.image)}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/600x500/f1eee8/333?text=PremiumStore'"><span class="product-tag">${p.tag || ''}</span><button class="heart-btn ${wishlist.includes(p.id) ? 'liked' : ''}" data-wish="${p.id}" aria-label="Toggle wishlist"><i class="${wishlist.includes(p.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i></button></div><div class="product-info"><span class="product-category">${p.category}</span><button class="product-title" data-open="${p.id}">${p.name}</button><div class="rating"><span>★★★★★</span> ${p.rating || 4.5}</div><div class="product-bottom"><strong>${money(p.price)}</strong><button class="add-btn" data-add="${p.id}"><i class="fa-solid fa-plus"></i> Add</button></div></div></article>`).join('');
  if ($('#noProducts')) $('#noProducts').hidden = products.length > 0;
}
function chooseCategory(c) { category = c; $$('.filter-chip').forEach(b => b.classList.toggle('selected', b.dataset.category === c)); $$('.category-tile').forEach(b => b.classList.toggle('active', b.dataset.category === c)); loadProducts().catch(e => toast(e.message)); }
async function loadAccountData() {
  try {
    const me = await api('/auth/me');
    currentUser = me.user;
    const [c, w] = await Promise.all([api('/cart'), api('/wishlist')]);
    cart = (c.cart.items || []).filter(x => x.product).map(x => ({ ...x.product, id: x.product._id, qty: x.quantity }));
    wishlist = (w.wishlist.products || []).map(p => p._id);
  } catch (e) { cart = []; wishlist = []; currentUser = null; }
  refreshAll();
}
function refreshAll() { updateCart(); updateWishlist(); renderStandaloneLists(); renderProductDetailsPage(); }
async function addCart(id) {
  if (!currentUser) return location.href = 'login.html';
  try { const d = await api('/cart', { method: 'POST', body: JSON.stringify({ productId: id, quantity: 1 }) }); cart = d.cart.items.filter(x => x.product).map(x => ({ ...x.product, id: x.product._id, qty: x.quantity })); refreshAll(); toast('Added to your bag'); }
  catch(e) { toast(e.message); }
}
function updateCart() {
  const count = cart.reduce((s,p)=>s+p.qty,0), total = cart.reduce((s,p)=>s+p.price*p.qty,0);
  if ($('#cartCount')) $('#cartCount').textContent = count;
  if ($('#cartHeadingCount')) $('#cartHeadingCount').textContent = '('+count+')';
  if ($('#cartTotal')) $('#cartTotal').textContent = money(total);
  if ($('#checkoutTotal')) $('#checkoutTotal').textContent = money(total);
  if ($('#cartItems')) $('#cartItems').innerHTML = cart.map(p=>`<div class="line-item"><img src="${imageUrl(p.image)}" alt="${p.name}"><div class="line-info"><strong>${p.name}</strong><small>${money(p.price)}</small><div class="qty"><button data-qty="${p.id}" data-delta="-1">−</button><span>${p.qty}</span><button data-qty="${p.id}" data-delta="1">+</button></div></div><button class="remove-btn" data-remove="${p.id}">×</button></div>`).join('');
}
function updateWishlist() {
  if ($('#wishCount')) $('#wishCount').textContent = wishlist.length;
  if ($('#wishHeadingCount')) $('#wishHeadingCount').textContent = '('+wishlist.length+')';
  if ($('#wishItems')) $('#wishItems').innerHTML = wishlist.map(id=>products.find(p=>p.id===id)).filter(Boolean).map(p=>`<div class="line-item"><img src="${imageUrl(p.image)}" alt="${p.name}"><div class="line-info"><strong>${p.name}</strong><small>${money(p.price)}</small><button class="text-action" data-add="${p.id}">Add to bag</button></div><button class="remove-btn" data-wish="${p.id}">♥</button></div>`).join('');
}
async function toggleWish(id) {
  if (!currentUser) return location.href = 'login.html';
  try {
    const adding = !wishlist.includes(id);
    await api('/wishlist/'+id, { method: adding ? 'POST' : 'DELETE' });
    wishlist = adding ? [...wishlist,id] : wishlist.filter(x=>x!==id);
    updateWishlist(); renderProducts(); renderStandaloneLists(); renderProductDetailsPage();
    toast(adding ? 'Saved to wishlist' : 'Removed from wishlist');
  } catch(e) { toast(e.message); }
}
function renderStandaloneLists() {
  const cartList=$('#cartPageItems'), wishList=$('#wishlistPageItems');
  const empty=(icon,title,desc)=>`<div class="page-empty"><span>${icon}</span><h3>${title}</h3><p>${desc}</p><a class="primary-btn" href="products.html">Explore products</a></div>`;
  if(cartList){ cartList.innerHTML=cart.length?cart.map(p=>`<article class="page-line-item"><img src="${imageUrl(p.image)}" alt="${p.name}"><div class="page-line-info"><span class="product-category">${p.category}</span><a href="product_details.html?id=${p.id}" class="page-product-name">${p.name}</a><strong>${money(p.price)}</strong><div class="qty"><button data-qty="${p.id}" data-delta="-1">−</button><span>${p.qty}</span><button data-qty="${p.id}" data-delta="1">+</button></div></div><button class="remove-btn" data-remove="${p.id}">×</button></article>`).join(''):empty('🛍','Your bag is waiting','Sign in and add products to your bag.'); if($('#pageCartTotal'))$('#pageCartTotal').textContent=money(cart.reduce((n,p)=>n+p.price*p.qty,0)); if($('#pageCheckout'))$('#pageCheckout').disabled=!cart.length;}
  if(wishList){const items=wishlist.map(id=>products.find(p=>p.id===id)).filter(Boolean);wishList.innerHTML=items.length?items.map(p=>`<article class="page-product-card"><a href="product_details.html?id=${p.id}" class="page-product-image"><img src="${imageUrl(p.image)}" alt="${p.name}"></a><div class="page-product-card-info"><span class="product-category">${p.category}</span><a href="product_details.html?id=${p.id}" class="page-product-name">${p.name}</a><strong>${money(p.price)}</strong><div class="page-card-actions"><button class="primary-btn" data-add="${p.id}">Add to bag</button><button class="remove-btn" data-wish="${p.id}">♥</button></div></div></article>`).join(''):empty('♡','Nothing saved just yet','Sign in and tap a heart to save a product.');}
}
async function renderProductDetailsPage() {
  const root=$('#standaloneProductDetail'); if(!root)return;
  const id=new URLSearchParams(location.search).get('id');
  try { const {product:p}=await api('/products/'+id); document.title=p.name+' — PremiumStore';
    root.innerHTML=`<div class="product-detail-page"><div class="product-detail-photo"><img src="${imageUrl(p.image)}" alt="${p.name}"><span class="product-tag">${p.tag||''}</span></div><div class="product-detail-info"><a href="products.html" class="back-link">← Back to collection</a><span class="eyebrow">${p.category} · CURATED FOR YOU</span><h1>${p.name}</h1><div class="detail-rating"><span>★★★★★</span> ${p.rating||4.5} / 5</div><div class="detail-price">${money(p.price)}</div><p class="detail-description">${p.desc||''}</p><div class="detail-feature"><span>✓ In stock (${p.stock})</span><span>Ships in 1–3 days</span><span>Easy 7-day returns</span></div><div class="detail-meta"><span>Colour</span><strong>${p.color||'—'}</strong></div><div class="detail-meta"><span>Category</span><strong>${p.category}</strong></div><div class="detail-actions"><button class="primary-btn" data-add="${p._id}">Add to bag</button><button class="detail-wish ${wishlist.includes(p._id)?'liked':''}" data-wish="${p._id}">♡</button></div><div class="detail-safe"><strong>Cash on Delivery available</strong><p>Payment gateway is not connected.</p></div></div></div>`;
  } catch(e){root.innerHTML=`<p class="page-empty">${e.message}</p>`;}
}
function renderCategoriesPage(){const root=$('#categoryPageGrid');if(!root)return;const cats=[['Electronics','⌁','Audio, accessories and useful tech.','Smart daily upgrades'],['Fashion','◈','Everyday pieces and timeless details.','Wear it your way'],['Lifestyle','☼','Thoughtful picks for your space and routine.','Little life upgrades'],['Sports','↗','Comfortable essentials for active days.','Made to get moving']];root.innerHTML=cats.map(c=>`<a class="category-page-card" href="products.html?category=${c[0]}"><span class="category-page-icon">${c[1]}</span><span class="eyebrow">EXPLORE COLLECTION</span><h2>${c[0]}</h2><p>${c[2]}</p><strong>${c[3]} →</strong></a>`).join('');}
function setAuth(mode){if(!$('#authTitle'))return;authMode=mode;$('#authTitle').textContent=mode==='login'?'Welcome back':'Create your account';$('#authSubtitle').textContent=mode==='login'?'Sign in to save your favourites.':'A few details and you’re all set.';$('#nameWrap').hidden=mode==='login';$('#authName').required=mode==='register';$('#authPassword').autocomplete=mode==='login'?'current-password':'new-password';$('#authSubmit').innerHTML=(mode==='login'?'Sign in':'Create account')+' →';$('#switchText').textContent=mode==='login'?'New around here?':'Already have an account?';$('#switchAuth').textContent=mode==='login'?'Create an account':'Sign in';}
$$('[data-category]').forEach(b=>b.addEventListener('click',()=>{chooseCategory(b.dataset.category);if($('#products'))$('#products').scrollIntoView({behavior:'smooth'});else location.href='products.html?category='+encodeURIComponent(b.dataset.category);}));
if($('#searchInput'))$('#searchInput').addEventListener('input',()=>loadProducts().catch(e=>toast(e.message)));
if($('#sortSelect'))$('#sortSelect').addEventListener('change',()=>loadProducts().catch(e=>toast(e.message)));
document.addEventListener('click',async e=>{
 const add=e.target.closest('[data-add]'),wish=e.target.closest('[data-wish]'),open=e.target.closest('[data-open]'),qty=e.target.closest('[data-qty]'),remove=e.target.closest('[data-remove]');
 if(add) await addCart(add.dataset.add);
 if(wish) await toggleWish(wish.dataset.wish);
 if(open) location.href='product_details.html?id='+encodeURIComponent(open.dataset.open);
 if(qty){const item=cart.find(p=>p.id===qty.dataset.qty);if(item){const n=item.qty+Number(qty.dataset.delta);try{if(n<1)await api('/cart/'+item.id,{method:'DELETE'});else await api('/cart/'+item.id,{method:'PATCH',body:JSON.stringify({quantity:n})});await loadAccountData();}catch(err){toast(err.message);}}}
 if(remove){try{await api('/cart/'+remove.dataset.remove,{method:'DELETE'});await loadAccountData();}catch(err){toast(err.message);}}
});
if($('#loginOpen'))$('#loginOpen').addEventListener('click',()=>location.href='login.html');
if($('#logoutButton'))$('#logoutButton').addEventListener('click',async()=>{try{await api('/auth/logout',{method:'POST'});}finally{location.href='index.html';}});
if($('#cartOpen'))$('#cartOpen').addEventListener('click',()=>location.href='cart.html');
if($('#wishOpen'))$('#wishOpen').addEventListener('click',()=>location.href='wishlist.html');
if($('#switchAuth'))$('#switchAuth').addEventListener('click',()=>setAuth(authMode==='login'?'register':'login'));
if($('#authForm'))$('#authForm').addEventListener('submit',async e=>{
 e.preventDefault();const payload={email:$('#authEmail').value,password:$('#authPassword').value};if(authMode==='register')payload.name=$('#authName').value;
 try{const result=await api('/auth/'+authMode,{method:'POST',body:JSON.stringify(payload)});await loadAccountData();if($('#loginSuccess'))$('#loginSuccess').textContent=authMode==='login'?'Signed in successfully.':'Account created successfully.';toast('Welcome to PremiumStore');setTimeout(()=>location.href=result.user?.role==='admin'?'admin-dashboard.html':'index.html',700);}
 catch(err){if($('#loginSuccess'))$('#loginSuccess').textContent=err.message;toast(err.message);}
});
if($('#pageCheckout'))$('#pageCheckout').addEventListener('click',()=>{if(!currentUser)return location.href='login.html';if($('#pageCheckoutForm'))$('#pageCheckoutForm').hidden=false;});
if($('#checkoutOpen'))$('#checkoutOpen').addEventListener('click',()=>{if(!currentUser)return location.href='login.html';if(!cart.length)return toast('Your bag is empty.');$('#checkoutModal')?.classList.add('open');});
if($('#checkoutForm'))$('#checkoutForm').addEventListener('submit',async e=>{e.preventDefault();const payload=Object.fromEntries(new FormData(e.target).entries());try{const d=await api('/orders',{method:'POST',body:JSON.stringify(payload)});document.querySelectorAll('.modal').forEach(m=>m.classList.remove('open'));e.target.reset();toast('Order placed successfully · '+d.order._id);await loadAccountData();}catch(err){toast(err.message);}});
if($('#pageCheckoutForm'))$('#pageCheckoutForm').addEventListener('submit',async e=>{
 e.preventDefault();const fd=new FormData(e.target),payload=Object.fromEntries(fd.entries());
 try{const d=await api('/orders',{method:'POST',body:JSON.stringify(payload)});toast('Order placed! Order ID: '+d.order._id);e.target.reset();e.target.hidden=true;await loadAccountData();}
 catch(err){toast(err.message);}
});
if($('#newsletterForm'))$('#newsletterForm').addEventListener('submit',e=>{e.preventDefault();toast('Thank you for subscribing!');e.target.reset();});
if($('#menuToggle'))$('#menuToggle').addEventListener('click',()=>$('#navMenu')?.classList.toggle('nav-open'));
if($('#navMenu'))$('#navMenu').addEventListener('click',e=>{if(e.target.tagName==='A')$('#navMenu').classList.remove('nav-open');});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.drawer,.modal').forEach(x=>x.classList.remove('open'));});
(async()=>{try{await loadProducts();await loadAccountData();renderCategoriesPage();await renderProductDetailsPage();}catch(e){toast(e.message+' Check that the server and database are running.');}})();
