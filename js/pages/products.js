// js/pages/products.js

import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { ProductService } from '../services/productService.js';
import { CategoryService } from '../services/categoryService.js';

document.addEventListener('DOMContentLoaded', async () => {
    const headerElement = document.querySelector('header') || document.getElementById('app-header');
    if(headerElement) headerElement.innerHTML = renderHeader();
    
    const footerElement = document.querySelector('footer') || document.getElementById('app-footer');
    if(footerElement) footerElement.innerHTML = renderFooter();

    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('category') || 'all';

    const titleEl = document.getElementById('page-title');
    const descEl = document.getElementById('page-desc');
    const gridEl = document.getElementById('products-grid');

    if (categoryId === 'all') {
        titleEl.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> تمام محصولات صنعتی`;
        descEl.textContent = 'جستجو و استعلام مستقیم از بین تمامی محصولات موجود در شبکه تأمین‌کنندگان TradeCore.';
    } else {
        const category = await CategoryService.getCategoryById(categoryId);
        if (category) {
            titleEl.innerHTML = `<span style="vertical-align: middle;">${category.icon}</span> ${category.name}`;
            descEl.textContent = category.description;
        } else {
            titleEl.textContent = 'دسته‌بندی نامشخص';
            descEl.textContent = 'این دسته‌بندی وجود ندارد یا حذف شده است.';
        }
    }

    const products = await ProductService.getProductsByCategoryId(categoryId);
    renderProductCards(products, gridEl);
});

function renderProductCards(products, container) {
    if (products.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 3rem; width: 100%; color: #ef4444; font-weight: bold; font-size: 1.2rem; background: white; border-radius: 12px; border: 1px dashed #ef4444;">هیچ محصولی در این دسته‌بندی یافت نشد.</div>';
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
              <span class="product-price ${product.priceType === 'rfq' ? 'price-rfq' : ''}">${product.priceRange}</span>
            </div>
          </div>
          <div class="product-actions">
            <button class="btn btn-primary btn-full" onclick="window.location.href='product.html?id=${product.id}&openRfq=true'">درخواست قیمت (RFQ)</button>
          </div>
        </div>
    `).join('');
}