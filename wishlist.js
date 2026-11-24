// Wishlist controller shared across all pages to save and display liked items
(function (global) {
  // Read the product list provided by catalog.js
  const { PRODUCTS = [], PRODUCT_MAP = {} } = global.NLS_CATALOG || {};

  // Browser localStorage key names used to remember saved wishlist items
  const STORAGE_KEY = 'nls_wishlist_items';
  const LEGACY_WISHLIST_KEY = 'nls_wishlist';
  const LEGACY_CART_KEY = 'nls_cart_count';

  // Lookup table mapping each product id to its wishlist display fields
  const PRODUCT_CATALOG = Object.fromEntries(
    PRODUCTS.map((item) => [
      item.id,
      {
        id: item.id,
        title: item.name,
        price: `S$ ${item.priceFormatted}`,
        line: `${item.gender} · ${item.line}`,
        image: item.primaryImage,
        url: `products.html?item=${encodeURIComponent(item.id)}`,
      },
    ])
  );

// Clean up an item object and match it to a real product in the catalog
function normalizeItem(raw) {
  if (!raw || !raw.id) return null;
  const catalogEntry = PRODUCT_CATALOG[String(raw.id)];
  if (!catalogEntry) return null;
  const rawPrice = raw.price || catalogEntry.price || '';
  const formattedPrice = rawPrice
    ? String(rawPrice).startsWith('S$')
      ? String(rawPrice)
      : `S$ ${rawPrice}`
    : '';
  return {
    id: catalogEntry.id,
    title: raw.title || catalogEntry.title,
    price: formattedPrice,
    line: raw.line || catalogEntry.line,
    image: raw.image || catalogEntry.image,
    placeholder: '',
    size: raw.size || '',
    color: raw.color || PRODUCT_MAP[catalogEntry.id]?.colour || '',
    url: raw.url || catalogEntry.url,
  };
}

// Remove any duplicate or invalid items from a saved wishlist array
function deduplicateItems(list) {
  const seen = new Map();
  list.forEach((entry) => {
    const normalized = normalizeItem(entry);
    if (normalized && !seen.has(normalized.id)) {
      seen.set(normalized.id, normalized);
    }
  });
  return Array.from(seen.values());
}

// Load saved items from localStorage and remove outdated storage keys
function migrateLegacyStorage() {
  // Remove deprecated keys and stale fake items from previous versions
  try {
    localStorage.removeItem(LEGACY_CART_KEY);
    localStorage.removeItem(LEGACY_WISHLIST_KEY);
  } catch {
    // ignore storage errors
  }

  let existing = [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(parsed)) {
      existing = deduplicateItems(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
  } catch {
    existing = [];
  }

  return existing;
}

let wishlistItems = migrateLegacyStorage();

// Save the current wishlist items to localStorage and notify open UI components
function persistItems() {
  wishlistItems = deduplicateItems(wishlistItems);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems));
  } catch {
    // ignore storage errors
  }
  window.dispatchEvent(new CustomEvent('nls:wishlist-change', { detail: { items: [...wishlistItems] } }));
}

// Public helper functions to read, check, add, remove, or toggle saved items
function getWishlistItems() {
  return [...wishlistItems];
}

function hasWishlistItem(id) {
  return wishlistItems.some((item) => item.id === String(id));
}

function addWishlistItem(item) {
  const normalized = normalizeItem(item);
  if (!normalized) return false;
  if (hasWishlistItem(normalized.id)) {
    // Prevent duplicates — do not insert a second entry
    return false;
  }
  wishlistItems.push(normalized);
  persistItems();
  renderWishlistUI();
  return true;
}

function removeWishlistItem(id) {
  const targetId = String(id);
  const next = wishlistItems.filter((item) => item.id !== targetId);
  if (next.length === wishlistItems.length) return false;
  wishlistItems = next;
  persistItems();
  renderWishlistUI();
  return true;
}

function toggleWishlistItem(item) {
  const normalized = normalizeItem(item);
  if (!normalized) return false;
  if (hasWishlistItem(normalized.id)) {
    removeWishlistItem(normalized.id);
    return false;
  }
  addWishlistItem(normalized);
  return true;
}

// Build the slide-over wishlist drawer HTML once and attach click/Escape close events
let drawerEl = null;
let lastTriggerEl = null;

function ensureDrawer() {
  if (drawerEl) return drawerEl;

  drawerEl = document.createElement('div');
  drawerEl.id = 'wishlist-drawer';
  drawerEl.className = 'wishlist-drawer';
  drawerEl.setAttribute('role', 'dialog');
  drawerEl.setAttribute('aria-modal', 'true');
  drawerEl.setAttribute('aria-labelledby', 'wishlist-drawer-title');
  drawerEl.hidden = true;

  drawerEl.innerHTML = `
    <div class="wishlist-drawer-backdrop" id="wishlist-drawer-backdrop"></div>
    <aside class="wishlist-drawer-panel">
      <div class="wishlist-drawer-header">
        <div>
          <h2 id="wishlist-drawer-title" class="wishlist-drawer-title">
            Saved Items <span id="wishlist-drawer-count" class="wishlist-drawer-count">(0)</span>
          </h2>
          <p class="wishlist-drawer-subtitle">Your No Limits Sports wishlist</p>
        </div>
        <button type="button" id="wishlist-drawer-close" class="qv-close-btn wishlist-drawer-close" aria-label="Close wishlist">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="wishlist-drawer-body" id="wishlist-drawer-body"></div>
      <div class="wishlist-drawer-footer" id="wishlist-drawer-footer" hidden>
        <a href="contactus.html" id="wishlist-inquire-all" class="btn-dark wishlist-inquire-all-btn">
          Inquire About Saved Items
        </a>
      </div>
    </aside>
  `;

  document.body.appendChild(drawerEl);

  drawerEl.querySelector('#wishlist-drawer-backdrop').addEventListener('click', closeWishlistDrawer);
  drawerEl.querySelector('#wishlist-drawer-close').addEventListener('click', closeWishlistDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawerEl && !drawerEl.hidden) {
      closeWishlistDrawer();
    }
  });

  drawerEl.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('[data-wishlist-remove]');
    if (removeBtn) {
      removeWishlistItem(removeBtn.dataset.wishlistRemove);
      return;
    }

    const addCartBtn = e.target.closest('[data-wishlist-cart]');
    if (addCartBtn) {
      const itemId = addCartBtn.dataset.wishlistCart;
      const saved = wishlistItems.find((entry) => entry.id === itemId);
      if (saved && global.NLS_CART && typeof global.NLS_CART.addCartItem === 'function') {
        global.NLS_CART.addCartItem(saved, 1);
        closeWishlistDrawer();
        global.NLS_CART.openCartDrawer();
      }
      return;
    }

    const viewBtn = e.target.closest('[data-wishlist-view]');
    if (viewBtn) {
      const itemId = viewBtn.dataset.wishlistView;
      const matchingCard = document.querySelector(`[data-id="${CSS.escape(itemId)}"]`);
      if (matchingCard && typeof window.__nlsOpenQuickView === 'function') {
        e.preventDefault();
        closeWishlistDrawer();
        window.__nlsOpenQuickView(matchingCard);
      }
    }
  });

  return drawerEl;
}

// Open the slide-over wishlist drawer and focus the close button
function openWishlistDrawer() {
  const drawer = ensureDrawer();
  renderDrawerContents();
  lastTriggerEl = document.activeElement;
  drawer.hidden = false;
  document.body.classList.add('modal-open');
  const closeBtn = drawer.querySelector('#wishlist-drawer-close');
  if (closeBtn) closeBtn.focus();
}

// Close the wishlist drawer and return focus to the button that opened it
function closeWishlistDrawer() {
  if (!drawerEl || drawerEl.hidden) return;
  drawerEl.hidden = true;
  document.body.classList.remove('modal-open');
  if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
    lastTriggerEl.focus();
    lastTriggerEl = null;
  }
}

// Escape special HTML characters before inserting product text into markup
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Render either the empty message or the list of saved products inside the drawer
function renderDrawerContents() {
  if (!drawerEl) return;
  const bodyEl = drawerEl.querySelector('#wishlist-drawer-body');
  const countEl = drawerEl.querySelector('#wishlist-drawer-count');
  const footerEl = drawerEl.querySelector('#wishlist-drawer-footer');
  const inquireAllLink = drawerEl.querySelector('#wishlist-inquire-all');

  countEl.textContent = `(${wishlistItems.length})`;

  if (wishlistItems.length === 0) {
    footerEl.hidden = true;
    bodyEl.innerHTML = `
      <div class="wishlist-empty-state">
        <div class="wishlist-empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
        <h3>Your wishlist is empty</h3>
        <p>Tap the heart icon on any trail shoe or gear item to save it here for later.</p>
        <a href="products.html" class="btn-dark wishlist-empty-cta">Browse Shoes &amp; Gear</a>
      </div>
    `;
    return;
  }

  footerEl.hidden = false;
  const titlesSummary = wishlistItems.map((i) => i.title).join(', ');
  inquireAllLink.href = `contactus.html?subject=${encodeURIComponent(`Wishlist Inquiry: ${titlesSummary}`)}`;

  bodyEl.innerHTML = `<ul class="wishlist-item-list">${wishlistItems
    .map((item) => {
      const metaParts = [item.line, item.color, item.size].filter(Boolean).join(' · ');
      const inquireUrl = `contactus.html?subject=${encodeURIComponent(`Product Inquiry: ${item.title}`)}`;
      return `
        <li class="wishlist-item-card">
          <div class="wishlist-item-thumb">
            ${
              item.image
                ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />`
                : `<span class="wishlist-thumb-placeholder">${escapeHtml(item.placeholder || 'Image')}</span>`
            }
          </div>
          <div class="wishlist-item-info">
            <div class="wishlist-item-title">${escapeHtml(item.title)}</div>
            ${metaParts ? `<div class="wishlist-item-meta">${escapeHtml(metaParts)}</div>` : ''}
            <div class="wishlist-item-price">${escapeHtml(item.price)}</div>
            <div class="wishlist-item-actions">
              <button
                type="button"
                class="wishlist-view-btn"
                data-wishlist-cart="${escapeHtml(item.id)}"
              >
                Add to Cart
              </button>
              <a
                href="${escapeHtml(item.url || inquireUrl)}"
                class="wishlist-remove-btn"
                data-wishlist-view="${escapeHtml(item.id)}"
              >
                View
              </a>
              <button
                type="button"
                class="wishlist-remove-btn"
                data-wishlist-remove="${escapeHtml(item.id)}"
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

// Update the header wishlist counter badge and heart icons on product cards
function renderWishlistUI() {
  const count = wishlistItems.length;
  const trigger = document.getElementById('wishlist-trigger');
  const countBadge = document.getElementById('wishlist-count');

  if (countBadge) {
    countBadge.textContent = String(count);
  }
  if (trigger) {
    trigger.classList.toggle('has-items', count > 0);
    trigger.setAttribute('aria-label', `Open wishlist, ${count} saved ${count === 1 ? 'item' : 'items'}`);
  }

  // Sync any card heart buttons present on index.html or products.html
  document.querySelectorAll('[data-id]').forEach((card) => {
    const btn = card.querySelector('.wishlist-btn, .product-wishlist-btn');
    if (!btn) return;
    const liked = hasWishlistItem(card.dataset.id);
    btn.classList.toggle('is-liked', liked);
    btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
  });

  renderDrawerContents();
}

// Connect the header heart icon button when the page finishes loading
function initWishlistHeader() {
  const trigger = document.getElementById('wishlist-trigger');
  if (trigger && !trigger.dataset.wishlistBound) {
    trigger.dataset.wishlistBound = 'true';
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openWishlistDrawer();
    });
  }
  renderWishlistUI();
}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWishlistHeader);
  } else {
    initWishlistHeader();
  }

  // Expose wishlist functions on window.NLS_WISHLIST for page scripts to use
  global.NLS_WISHLIST = {
    PRODUCT_CATALOG,
    getWishlistItems,
    hasWishlistItem,
    addWishlistItem,
    removeWishlistItem,
    toggleWishlistItem,
    openWishlistDrawer,
    closeWishlistDrawer,
    renderWishlistUI,
  };
})(window);
