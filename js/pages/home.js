// js/pages/home.js

import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { FeaturedContentService } from '../services/featuredContentService.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { AppStore } from '../data/appStore.js'; // 🌟 افزوده شد

document.addEventListener('DOMContentLoaded', () => {
  initHomePage();
});

async function initHomePage() {
  document.getElementById('app-header').innerHTML = renderHeader();
  document.getElementById('app-footer').innerHTML = renderFooter();
  
  await loadFeaturedCompanies();
  await loadFeaturedProducts();
}

async function loadFeaturedCompanies() {
  const track = document.getElementById('featured-companies-track');
  if (!track) return;
  
  track.innerHTML = '<div style="text-align: center; padding: 2rem; width: 100%;">در حال دریافت اطلاعات...</div>';
  const companies = await FeaturedContentService.getFeaturedCompanies();
  
  if (companies.length === 0) {
    track.innerHTML = `
        <div style="width: 100%; text-align: center; padding: 3rem; background: white; border: 1px dashed var(--color-border); border-radius: 12px; color: #64748b;">
            شرکتی در جایگاه ویژه قرار ندارد.
        </div>
    `;
    return;
  }
  
  const activeUserId = AppStore.getActiveUserId();

  // 🌟 قانون جدید: عدم ثبت بازدید (Impression) برای شرکت خودمان 🌟
  companies.forEach(c => {
      if (c.id !== activeUserId) {
          FeaturedContentService.trackView('Company', c.id);
      }
  });

  track.innerHTML = companies.map(biz => `
    <a href="business.html?id=${biz.id}" class="featured-company-card" onclick="window.trackFeaturedClick('Company', '${biz.id}')">
        <img src="${biz.logo || 'images/default-logo.png'}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 1px solid #e2e8f0; margin-bottom: 10px;">
        <h3 style="font-size: 1.1rem; color: #0f172a; margin-bottom: 5px; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${biz.name}</h3>
        <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 8px;">${biz.industry}</p>
        ${biz.status === 'verified' ? '<span style="color: #10b981; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 0.8rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> تایید شده</span>' : ''}
    </a>
  `).join('');

  initContinuousCarousel('featured-companies-track', 'btn-prev-companies', 'btn-next-companies');
}

async function loadFeaturedProducts() {
  const track = document.getElementById('featured-products-track');
  if (!track) return;
  
  track.innerHTML = '<div style="text-align: center; padding: 2rem; width: 100%; grid-column: 1/-1;">در حال دریافت اطلاعات...</div>';
  const products = await FeaturedContentService.getFeaturedProducts();
  
  if (products.length === 0) {
    track.innerHTML = `
        <div style="width: 100%; text-align: center; padding: 3rem; background: white; border: 1px dashed var(--color-border); border-radius: 12px; color: #64748b; grid-column: 1 / -1;">
            محصولی در جایگاه ویژه قرار ندارد.
        </div>
    `;
    return;
  }

  const activeUserId = AppStore.getActiveUserId();

  // 🌟 قانون جدید: عدم ثبت بازدید (Impression) برای محصول خودمان 🌟
  products.forEach(p => {
      if (p.supplierId !== activeUserId) {
          FeaturedContentService.trackView('Product', p.id);
      }
  });

  track.innerHTML = products.map(product => `
    <div class="product-card" style="box-shadow: 0 2px 4px rgba(0,0,0,0.02); height: 260px; display: flex; flex-direction: column;">
        
        <div class="product-image-wrapper" style="height: 110px; flex-shrink: 0;">
            <a href="product.html?id=${product.id}" onclick="window.trackFeaturedClick('Product', '${product.id}')">
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            </a>
        </div>
        
        <div class="product-details" style="padding: 0.8rem; flex-grow: 1; display: flex; flex-direction: column;">
            <a href="product.html?id=${product.id}" style="text-decoration: none;" onclick="window.trackFeaturedClick('Product', '${product.id}')">
                <h3 class="product-title" style="font-size: 0.9rem; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${product.name}</h3>
            </a>
            
            <p class="product-desc" style="font-size: 0.75rem; margin: 0 0 6px 0; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${product.shortDescription}</p>
            
            <div style="margin-top: auto; border-top: 1px solid #f1f5f9; padding-top: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.75rem; font-weight: 600; color: var(--color-primary); display: flex; align-items: center; gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60%;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path></svg>
                    ${product.supplierName}
                </span>
                <span class="product-price ${product.priceType === 'rfq' ? 'price-rfq' : ''}" style="font-size: 0.75rem; flex-shrink:0; padding: 2px 6px;">${product.priceRange}</span>
            </div>
            
            <button class="btn btn-primary btn-full" style="padding: 6px; font-size: 0.8rem;" onclick="window.location.href='product.html?id=${product.id}&openRfq=true'">درخواست قیمت (RFQ)</button>
        </div>

    </div>
  `).join('');

  initContinuousCarousel('featured-products-track', 'btn-prev-products', 'btn-next-products');
}

function initContinuousCarousel(trackId, prevBtnId, nextBtnId) {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    if (!track) return;

    let isPaused = false;
    let manualOverride = false; 
    let animationFrameId;
    const scrollSpeed = 0.5; 

    function scrollStep() {
        if (!isPaused && !manualOverride) {
            track.scrollLeft -= scrollSpeed;
            
            const maxScroll = track.scrollWidth - track.clientWidth;
            if (Math.abs(track.scrollLeft) >= maxScroll - 1) {
                track.scrollLeft = 0; 
            }
        }
        animationFrameId = requestAnimationFrame(scrollStep);
    }

    animationFrameId = requestAnimationFrame(scrollStep);

    track.addEventListener('mouseenter', () => isPaused = true);
    track.addEventListener('mouseleave', () => isPaused = false);
    track.addEventListener('touchstart', () => isPaused = true);
    track.addEventListener('touchend', () => isPaused = false);

    function doManualScroll(amount) {
        manualOverride = true; 
        track.scrollBy({ left: amount, behavior: 'smooth' });
        
        clearTimeout(track.scrollTimeout);
        track.scrollTimeout = setTimeout(() => {
            manualOverride = false;
        }, 600);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => doManualScroll(-300));
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => doManualScroll(300));
    }
}

window.trackFeaturedClick = (type, id) => {
    FeaturedContentService.trackClick(type, id);
};