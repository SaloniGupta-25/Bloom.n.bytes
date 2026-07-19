/* =========================================================
   Bloom & Bytes - Vanilla JavaScript Interactions
   ========================================================= */

const body = document.body;
const header = document.querySelector("#siteHeader");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#primaryMenu");
const backToTop = document.querySelector("#backToTop");
const searchPanel = document.querySelector("#searchPanel");
const searchToggle = document.querySelector(".search-toggle");
const searchClose = document.querySelector(".search-close");
const searchInput = document.querySelector("#siteSearch");
const cartDrawer = document.querySelector("#cartDrawer");
const cartToggle = document.querySelector(".cart-toggle");
const cartClose = document.querySelector(".cart-close");
const drawerScrim = document.querySelector("#drawerScrim");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const cartCount = document.querySelector(".cart-count");
const wishlistCount = document.querySelector(".wishlist-count");
const toast = document.querySelector("#toast");
const newsletterForm = document.querySelector("#newsletterForm");
const formMessage = document.querySelector("#formMessage");
const year = document.querySelector("#year");

const state = {
  cart: [],
  wishlist: new Set()
};

/* Header and navigation */
function updateHeader() {
  const isScrolled = window.scrollY > 28;
  header.classList.toggle("scrolled", isScrolled);
  backToTop.classList.toggle("visible", window.scrollY > 620);
}

function closeMobileMenu() {
  navToggle.classList.remove("active");
  navToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("active");
  body.classList.remove("menu-open");
}

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.classList.toggle("active");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navMenu.classList.toggle("active", isOpen);
  body.classList.toggle("menu-open", isOpen);
});

navMenu.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeMobileMenu();
  }
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

/* Optional official logo fallback */
document.querySelectorAll(".brand-logo-image").forEach((logo) => {
  logo.addEventListener("error", () => {
    logo.classList.add("is-hidden");
  });
});

/* Search panel */
function openSearch() {
  searchPanel.classList.add("active");
  searchPanel.setAttribute("aria-hidden", "false");
  body.classList.add("search-open");
  setTimeout(() => searchInput.focus(), 80);
}

function closeSearch() {
  searchPanel.classList.remove("active");
  searchPanel.setAttribute("aria-hidden", "true");
  body.classList.remove("search-open");
  searchToggle.focus();
}

searchToggle.addEventListener("click", openSearch);
searchClose.addEventListener("click", closeSearch);
searchPanel.addEventListener("click", (event) => {
  if (event.target === searchPanel) {
    closeSearch();
  }
});

searchInput.addEventListener("input", (event) => {
  const term = event.target.value.trim().toLowerCase();
  document.querySelectorAll(".product-card").forEach((card) => {
    const searchable = `${card.dataset.name} ${card.dataset.category}`.toLowerCase();
    card.classList.toggle("is-hidden", Boolean(term) && !searchable.includes(term));
  });
});

/* Cart drawer */
function openCart() {
  cartDrawer.classList.add("active");
  cartDrawer.setAttribute("aria-hidden", "false");
  drawerScrim.hidden = false;
  requestAnimationFrame(() => drawerScrim.classList.add("active"));
  body.classList.add("drawer-open");
}

function closeCart() {
  cartDrawer.classList.remove("active");
  cartDrawer.setAttribute("aria-hidden", "true");
  drawerScrim.classList.remove("active");
  body.classList.remove("drawer-open");
  setTimeout(() => {
    drawerScrim.hidden = true;
  }, 250);
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function renderCart() {
  cartItems.innerHTML = "";

  if (state.cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is ready for something beautiful.</p>';
  } else {
    state.cart.forEach((item, index) => {
      const line = document.createElement("article");
      line.className = "cart-line";
      line.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <p>${formatPrice(item.price)}</p>
        </div>
        <button class="remove-line" type="button" aria-label="Remove ${item.name}" data-index="${index}">&times;</button>
      `;
      cartItems.appendChild(line);
    });
  }

  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = formatPrice(total);
  cartCount.textContent = state.cart.length;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("active");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("active");
  }, 2400);
}

cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
drawerScrim.addEventListener("click", closeCart);

cartItems.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".remove-line");
  if (!removeButton) return;

  const index = Number(removeButton.dataset.index);
  const [removed] = state.cart.splice(index, 1);
  renderCart();
  showToast(`${removed.name} removed from cart`);
});

document.querySelectorAll(".add-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".product-card");
    const item = {
      name: card.dataset.name,
      price: Number(card.dataset.price),
      image: card.querySelector("img").getAttribute("src")
    };

    state.cart.push(item);
    renderCart();
    showToast(`${item.name} added to cart`);
  });
});

/* Product filtering */
function setActiveFilter(filter) {
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });

  document.querySelectorAll(".product-card").forEach((card) => {
    const isVisible = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("is-hidden", !isVisible);
  });
}

document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    setActiveFilter(button.dataset.filter);
  });
});

document.querySelectorAll("[data-filter-link]").forEach((link) => {
  link.addEventListener("click", () => {
    setActiveFilter(link.dataset.filterLink);
  });
});

/* Wishlist */
document.querySelectorAll(".wishlist-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".product-card");
    const name = card.dataset.name;

    if (state.wishlist.has(name)) {
      state.wishlist.delete(name);
      button.classList.remove("active");
      button.innerHTML = "&#9825;";
      showToast(`${name} removed from wishlist`);
    } else {
      state.wishlist.add(name);
      button.classList.add("active");
      button.innerHTML = "&#9829;";
      showToast(`${name} saved to wishlist`);
    }

    wishlistCount.textContent = state.wishlist.size;
  });
});

/* Scroll reveal and counters */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll(".reveal, .reveal-left, .zoom-in").forEach((element) => {
  revealObserver.observe(element);
});

function animateCounter(counter) {
  const target = Number(counter.dataset.target);
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = Math.round(target * eased).toLocaleString("en-US");

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else if (target === 98) {
      counter.textContent = "98%";
    } else {
      counter.textContent = target.toLocaleString("en-US");
    }
  }

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll(".counter").forEach((counter) => {
  counterObserver.observe(counter);
});

/* Forms */
newsletterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = new FormData(newsletterForm).get("email").trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  formMessage.classList.toggle("error", !isValid);
  formMessage.textContent = isValid
    ? "Thank you. Your private edit is on its way."
    : "Please enter a valid email address.";

  if (isValid) {
    newsletterForm.reset();
  }
});

document.querySelector(".footer-form").addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("Thank you for subscribing");
  event.currentTarget.reset();
});

/* Global controls */
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (searchPanel.classList.contains("active")) {
    closeSearch();
  }

  if (cartDrawer.classList.contains("active")) {
    closeCart();
  }

  if (navMenu.classList.contains("active")) {
    closeMobileMenu();
  }
});

year.textContent = new Date().getFullYear();
renderCart();
