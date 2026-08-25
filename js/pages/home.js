// js/pages/home.js

import { CategoryService } from '../services/categoryService.js';
import { ProductService } from '../services/productService.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

document.addEventListener('DOMContentLoaded', () => {
  initHomePage();
});

async function initHomePage() {
  document.getElementById('app-header').innerHTML = renderHeader();
  document.getElementById('app-footer').innerHTML = renderFooter();
  
  initSearch(); // راه‌اندازی بخش جستجو
  
  await loadCategories();
  await loadFeaturedProducts();
}

/**
 * ایجاد نوار جستجو و هندل کردن رویدادها
 */
// فقط این تابع رو تو js/pages/home.js پیدا کن و جایگزین کن

function initSearch() {
  const searchContainer = document.getElementById('search-container');
  if (!searchContainer) return;

  searchContainer.innerHTML = `
    <form id="hero-search-form" class="hero-search-form">
      <input type="text" id="search-input" class="search-input" placeholder="نام محصول یا تجهیزات مورد نیاز را جستجو کنید..." autocomplete="off">
      <button type="submit" class="btn btn-primary btn-search">جستجو در B2BMAP</button>
    </form>
  `;

  const searchForm = document.getElementById('hero-search-form');
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const query = document.getElementById('search-input').value;
    
    document.querySelector('.featured-products-section').scrollIntoView({ behavior: 'smooth' });
    
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = '<div style="text-align: center; padding: 2rem; width: 100%;">در حال بررسی...</div>';
    
    // اصلاح باگ عنوان:
    const sectionTitle = document.querySelector('.featured-products-section .section-title');
    if (query.trim() === '') {
      sectionTitle.textContent = "محصولات پیشنهادی";
    } else {
      sectionTitle.textContent = `نتایج جستجو برای: "${query}"`;
    }

    const results = await ProductService.searchProducts(query);
    renderProductCards(results, productGrid);
  });
}

async function loadCategories() {
  const categoryGrid = document.getElementById('category-grid');
  if (!categoryGrid) return;
  categoryGrid.innerHTML = '<div style="text-align: center; padding: 2rem;">در حال دریافت اطلاعات...</div>';
  const categories = await CategoryService.getAllCategories();
  if (categories.length === 0) {
    categoryGrid.innerHTML = '<p>دسته‌بندی یافت نشد.</p>';
    return;
  }
  categoryGrid.innerHTML = categories.map(cat => `
    <a href="products.html?category=${cat.id}" class="category-card" data-id="${cat.id}">
      <div class="category-icon">${cat.icon}</div>
      <div class="category-info">
        <h3 class="category-name">${cat.name}</h3>
        <p class="category-desc">${cat.description}</p>
      </div>
    </a>
  `).join('');
}

async function loadFeaturedProducts() {
  const productGrid = document.getElementById('product-grid');
  if (!productGrid) return;
  productGrid.innerHTML = '<div style="text-align: center; padding: 2rem; width: 100%;">در حال دریافت محصولات...</div>';
  
  // ریست کردن عنوان به حالت پیش‌فرض
  document.querySelector('.featured-products-section .section-title').textContent = "محصولات پیشنهادی";

  const products = await ProductService.getFeaturedProducts();
  renderProductCards(products, productGrid);
}

function renderProductCards(products, container) {
  if (products.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem; width: 100%; color: var(--color-text-muted);">محصولی با این مشخصات یافت نشد.</div>';
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}">
          <div class="product-image-wrapper">
            <a href="product.html?id=${product.id}">
              <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            </a>
            <span class="product-badge">${product.categoryName}</span>
          </div>
          <div class="product-details">
            <a href="product.html?id=${product.id}">
              <h3 class="product-title">${product.name}</h3>
            </a>
        <p class="product-desc">${product.shortDescription}</p>
        
        <!-- بخش جدید: نمایش نام تامین‌کننده -->
        <div class="product-supplier" style="font-size: 0.8rem; color: var(--color-primary); margin-top: 5px; display: flex; align-items: center; gap: 5px;">
          🏢 <span style="font-weight: 600;">${product.supplierName}</span>
          ${product.supplierStatus === 'verified' ? '<span title="شرکت تایید شده" style="color: #10b981;">✔️</span>' : ''}
        </div>

        <div class="product-meta">
          <span class="product-country">📍 ${product.country}</span>
          <span class="product-price ${product.priceType === 'rfq' ? 'price-rfq' : ''}">
            ${product.priceRange}
          </span>
        </div>
      </div>
      <div class="product-actions">
        <!-- اضافه شدن پارامتر openRfq=true به انتهای آدرس -->
        <button class="btn btn-primary btn-full" onclick="window.location.href='product.html?id=${product.id}&openRfq=true'">
          درخواست قیمت (RFQ)
        </button>
      </div>
    </div>
  `).join('');
}