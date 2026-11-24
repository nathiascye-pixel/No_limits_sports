// Shopping cart controller shared across all pages to manage cart items, quantities, and subtotal
(function (global) {
  // Read the product catalog provided by catalog.js
  const { PRODUCTS = [], PRODUCT_MAP = {} } = global.NLS_CATALOG || {};

  // Browser localStorage key used to remember shopping cart items between page loads
  const CART_STORAGE_KEY = 'nls_cart_items';

  // Build a quick lookup map from product id to price and display info
  const PRODUCT_LOOKUP = Object.fromEntries(
    PRODUCTS.map((item) => [
      item.id,
      {
        id: item.id,
        title: item.name,
        priceNumber: Number(item.price) || 0,
        price: `S$ ${item.priceFormatted}`,
        line: `${item.gender} · ${item.line}`,
        image: item.primaryImage,
        color: item.colour || '',
        defaultSize: Array.isArray(item.sizes) && item.sizes.length ? item.sizes[0] : '',
        url: `products.html?item=${encodeURIComponent(item.id)}`,
      },
    ])
  );

  // Create a unique key combining product id and chosen size so different sizes stay separate
  function getCartKey(id, size) {
    return `${String(id)}::${String(size || '').trim()}`;
  }

  // Clean up a cart entry and match it to a real product in catalog.js
  function normalizeCartItem(raw) {
    if (!raw || !raw.id) return null;
    const catalogEntry = PRODUCT_LOOKUP[String(raw.id)];
    if (!catalogEntry) return null;
    const size = String(raw.size || catalogEntry.defaultSize || '').trim();
    const qty = Math.max(1, Math.min(99, parseInt(raw.qty, 10) || 1));
    return {
      key: getCartKey(catalogEntry.id, size),
      id: catalogEntry.id,
      title: catalogEntry.title,
      priceNumber: catalogEntry.priceNumber,
      price: catalogEntry.price,
      line: catalogEntry.line,
      image: catalogEntry.image,
      color: PRODUCT_MAP[catalogEntry.id]?.colour || catalogEntry.color,
      size,
      qty,
      url: catalogEntry.url,
    };
  }

  // Combine duplicate product/size entries and drop invalid items
  function deduplicateCart(list) {
    const seen = new Map();
    list.forEach((entry) => {
      const item = normalizeCartItem(entry);
      if (!item) return;
      if (seen.has(item.key)) {
        const existing = seen.get(item.key);
        existing.qty = Math.min(99, existing.qty + item.qty);
      } else {
        seen.set(item.key, item);
      }
    });
    return Array.from(seen.values());
  }

  // Load saved cart items from localStorage when the page opens
  function loadCartItems() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? deduplicateCart(parsed) : [];
    } catch {
      return [];
    }
  }

  let cartItems = loadCartItems();
  let checkoutMessage = '';

  // Save the cart list to localStorage and notify any listening page scripts
  function persistCart() {
    cartItems = deduplicateCart(cartItems);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage errors in private browsing mode
    }
    window.dispatchEvent(new CustomEvent('nls:cart-change', { detail: { items: [...cartItems] } }));
  }

  // Return a copy of all items currently in the cart
  function getCartItems() {
    return cartItems.map((item) => ({ ...item }));
  }

  // Calculate the total quantity of all items in the cart
  function getCartCount() {
    return cartItems.reduce((sum, item) => sum + item.qty, 0);
  }

  // Calculate the total price in SGD across all cart items
  function getCartSubtotal() {
    return cartItems.reduce((sum, item) => sum + item.priceNumber * item.qty, 0);
  }

  // Add a product (with optional size and quantity) to the cart
  function addCartItem(item, qtyToAdd = 1) {
    const normalized = normalizeCartItem({ ...item, qty: qtyToAdd });
    if (!normalized) return false;
    checkoutMessage = '';
    const existing = cartItems.find((entry) => entry.key === normalized.key);
    if (existing) {
      existing.qty = Math.min(99, existing.qty + normalized.qty);
    } else {
      cartItems.push(normalized);
    }
    persistCart();
    renderCartUI();
    return true;
  }

  // Increase or decrease the quantity of one cart item (removes it if quantity reaches 0)
  function updateCartQuantity(key, delta) {
    const index = cartItems.findIndex((item) => item.key === String(key));
    if (index === -1) return false;
    const nextQty = cartItems[index].qty + delta;
    if (nextQty <= 0) {
      cartItems.splice(index, 1);
    } else {
      cartItems[index].qty = Math.min(99, nextQty);
    }
    persistCart();
    renderCartUI();
    return true;
  }

  // Remove a single line item from the cart by its key
  function removeCartItem(key) {
    const next = cartItems.filter((item) => item.key !== String(key));
    if (next.length === cartItems.length) return false;
    cartItems = next;
    persistCart();
    renderCartUI();
    return true;
  }

  // Remove every item from the cart
  function clearCart() {
    cartItems = [];
    persistCart();
    renderCartUI();
  }

  let cartDrawerEl = null;
  let lastTriggerEl = null;

  // Escape special HTML characters before rendering text inside HTML templates
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Format a number cleanly into Singapore dollars (e.g., S$ 139.90)
  function formatMoney(amount) {
    return `S$ ${Number(amount || 0).toFixed(2)}`;
  }

  // Build the slide-over cart drawer HTML once and attach button/keyboard handlers
  function ensureCartDrawer() {
    if (cartDrawerEl) return cartDrawerEl;

    cartDrawerEl = document.createElement('div');
    cartDrawerEl.id = 'cart-drawer';
    cartDrawerEl.className = 'wishlist-drawer cart-drawer';
    cartDrawerEl.setAttribute('role', 'dialog');
    cartDrawerEl.setAttribute('aria-modal', 'true');
    cartDrawerEl.setAttribute('aria-labelledby', 'cart-drawer-title');
    cartDrawerEl.hidden = true;

    cartDrawerEl.innerHTML = `
      <div class="wishlist-drawer-backdrop" id="cart-drawer-backdrop"></div>
      <aside class="wishlist-drawer-panel">
        <div class="wishlist-drawer-header">
          <div>
            <h2 id="cart-drawer-title" class="wishlist-drawer-title">
              Shopping Cart <span id="cart-drawer-count" class="wishlist-drawer-count">(0)</span>
            </h2>
            <p class="wishlist-drawer-subtitle">Free Islandwide Delivery in Singapore</p>
          </div>
          <button type="button" id="cart-drawer-close" class="qv-close-btn wishlist-drawer-close" aria-label="Close shopping cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="wishlist-drawer-body" id="cart-drawer-body"></div>
        <div class="wishlist-drawer-footer cart-drawer-footer" id="cart-drawer-footer" hidden>
          <div class="cart-summary-row">
            <span>Subtotal</span>
            <strong id="cart-subtotal" class="tabular-nums">S$ 0.00</strong>
          </div>
          <p class="cart-delivery-note">Standard Singapore islandwide delivery: Free</p>
          <div class="cart-footer-actions">
            <button type="button" id="cart-checkout-btn" class="btn-dark wishlist-inquire-all-btn">
              Checkout
            </button>
            <button type="button" id="cart-clear-btn" class="cart-clear-btn">
              Clear Cart
            </button>
          </div>
        </div>
      </aside>
    `;

    document.body.appendChild(cartDrawerEl);

    cartDrawerEl.querySelector('#cart-drawer-backdrop').addEventListener('click', closeCartDrawer);
    cartDrawerEl.querySelector('#cart-drawer-close').addEventListener('click', closeCartDrawer);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && cartDrawerEl && !cartDrawerEl.hidden) {
        closeCartDrawer();
      }
    });

    cartDrawerEl.addEventListener('click', (e) => {
      const decBtn = e.target.closest('[data-cart-dec]');
      if (decBtn) {
        updateCartQuantity(decBtn.dataset.cartDec, -1);
        return;
      }

      const incBtn = e.target.closest('[data-cart-inc]');
      if (incBtn) {
        updateCartQuantity(incBtn.dataset.cartInc, 1);
        return;
      }

      const removeBtn = e.target.closest('[data-cart-remove]');
      if (removeBtn) {
        removeCartItem(removeBtn.dataset.cartRemove);
        return;
      }

      const viewBtn = e.target.closest('[data-cart-view]');
      if (viewBtn) {
        const itemId = viewBtn.dataset.cartView;
        const matchingCard = document.querySelector(`[data-id="${CSS.escape(itemId)}"]`);
        if (matchingCard && typeof window.__nlsOpenQuickView === 'function') {
          e.preventDefault();
          closeCartDrawer();
          window.__nlsOpenQuickView(matchingCard);
        }
      }
    });

    cartDrawerEl.querySelector('#cart-clear-btn').addEventListener('click', () => {
      checkoutMessage = '';
      clearCart();
    });

    cartDrawerEl.querySelector('#cart-checkout-btn').addEventListener('click', () => {
      if (cartItems.length === 0) return;
      const itemCount = getCartCount();
      const totalStr = formatMoney(getCartSubtotal());
      checkoutMessage = `Order placed for ${itemCount} ${itemCount === 1 ? 'item' : 'items'} (${totalStr}). Thank you for shopping with No Limits Sports!`;
      clearCart();
    });

    return cartDrawerEl;
  }

  // Open the slide-over cart drawer and move focus to the close button
  function openCartDrawer() {
    const drawer = ensureCartDrawer();
    renderCartContents();
    lastTriggerEl = document.activeElement;
    drawer.hidden = false;
    document.body.classList.add('modal-open');
    const closeBtn = drawer.querySelector('#cart-drawer-close');
    if (closeBtn) closeBtn.focus();
  }

  // Close the cart drawer and return keyboard focus to the trigger button
  function closeCartDrawer() {
    if (!cartDrawerEl || cartDrawerEl.hidden) return;
    cartDrawerEl.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
      lastTriggerEl.focus();
      lastTriggerEl = null;
    }
  }

  // Render either the empty cart message, order confirmation, or the list of cart items
  function renderCartContents() {
    if (!cartDrawerEl) return;
    const bodyEl = cartDrawerEl.querySelector('#cart-drawer-body');
    const countEl = cartDrawerEl.querySelector('#cart-drawer-count');
    const footerEl = cartDrawerEl.querySelector('#cart-drawer-footer');
    const subtotalEl = cartDrawerEl.querySelector('#cart-subtotal');

    const totalCount = getCartCount();
    countEl.textContent = `(${totalCount})`;

    if (cartItems.length === 0) {
      footerEl.hidden = true;
      const bannerHtml = checkoutMessage
        ? `<div class="cart-checkout-feedback" role="status">${escapeHtml(checkoutMessage)}</div>`
        : '';
      bodyEl.innerHTML = `
        ${bannerHtml}
        <div class="wishlist-empty-state">
          <div class="wishlist-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h3>Your cart is empty</h3>
          <p>Add hiking shoes, jogging shoes, or sports gear to view them in your cart.</p>
          <a href="products.html" class="btn-dark wishlist-empty-cta">Browse Shoes &amp; Gear</a>
        </div>
      `;
      return;
    }

    footerEl.hidden = false;
    subtotalEl.textContent = formatMoney(getCartSubtotal());

    bodyEl.innerHTML = `<ul class="wishlist-item-list">${cartItems
      .map((item) => {
        const metaParts = [item.line, item.color, item.size].filter(Boolean).join(' · ');
        const lineTotal = formatMoney(item.priceNumber * item.qty);
        return `
          <li class="wishlist-item-card">
            <div class="wishlist-item-thumb">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />
            </div>
            <div class="wishlist-item-info">
              <a href="${escapeHtml(item.url)}" class="wishlist-item-title" data-cart-view="${escapeHtml(item.id)}">
                ${escapeHtml(item.title)}
              </a>
              ${metaParts ? `<div class="wishlist-item-meta">${escapeHtml(metaParts)}</div>` : ''}
              <div class="wishlist-item-price">${escapeHtml(lineTotal)}</div>
              <div class="wishlist-item-actions cart-item-actions">
                <div class="cart-qty-controls" role="group" aria-label="Quantity for ${escapeHtml(item.title)}">
                  <button
                    type="button"
                    class="cart-qty-btn"
                    data-cart-dec="${escapeHtml(item.key)}"
                    aria-label="Decrease quantity of ${escapeHtml(item.title)}"
                  >&minus;</button>
                  <span class="cart-qty-val tabular-nums">${item.qty}</span>
                  <button
                    type="button"
                    class="cart-qty-btn"
                    data-cart-inc="${escapeHtml(item.key)}"
                    aria-label="Increase quantity of ${escapeHtml(item.title)}"
                  >+</button>
                </div>
                <button
                  type="button"
                  class="wishlist-remove-btn"
                  data-cart-remove="${escapeHtml(item.key)}"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        `;
      })
      .join('')}</ul>`;
  }

  // Update the header cart counter badge and drawer contents
  function renderCartUI() {
    const count = getCartCount();
    const trigger = document.getElementById('cart-trigger');
    const countBadge = document.getElementById('cart-count');

    if (countBadge) {
      countBadge.textContent = String(count);
    }
    if (trigger) {
      trigger.classList.toggle('has-items', count > 0);
      trigger.setAttribute('aria-label', `Open cart, ${count} ${count === 1 ? 'item' : 'items'}`);
    }

    renderCartContents();
  }

  // Connect the header cart icon button when the page finishes loading
  function initCartHeader() {
    const trigger = document.getElementById('cart-trigger');
    if (trigger && !trigger.dataset.cartBound) {
      trigger.dataset.cartBound = 'true';
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openCartDrawer();
      });
    }
    renderCartUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartHeader);
  } else {
    initCartHeader();
  }

  // Expose cart functions on window.NLS_CART for page scripts and wishlist.js to use
  global.NLS_CART = {
    getCartItems,
    getCartCount,
    getCartSubtotal,
    addCartItem,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    openCartDrawer,
    closeCartDrawer,
    renderCartUI,
  };
})(window);
