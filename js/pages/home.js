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
        
        <div class="product-supplier" style="font-size: 0.8rem; color: var(--color-primary); margin-top: 5px; display: flex; align-items: center; gap: 5px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg> <span style="font-weight: 600;">${product.supplierName}</span>
          ${product.supplierStatus === 'verified' ? '<span title="شرکت تایید شده" style="color: #10b981; display: inline-flex;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' : ''}
        </div>

        <div class="product-meta">
          <span class="product-country" style="display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${product.country}</span>
          <span class="product-price ${product.priceType === 'rfq' ? 'price-rfq' : ''}">
            ${product.priceRange}
          </span>
        </div>
      </div>
      <div class="product-actions">
        <button class="btn btn-primary btn-full" onclick="window.location.href='product.html?id=${product.id}&openRfq=true'">
          درخواست قیمت (RFQ)
        </button>
      </div>
    </div>
  `).join('');
}